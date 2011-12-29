<?php

class Dhmedia_Devel_Model_Writer_Localxml extends Dhmedia_Devel_Model_File_Layout
{
	protected $sxe;
	
	public function __construct()
	{
		parent::__construct('local.xml');
	}
	
	protected function getAsSxe() {
		if (! $this->sxe instanceof Varien_Simplexml_Element) {
			$this->sxe = new Varien_Simplexml_Element($this->getContents());
		}
		
		return $this->sxe;
	}
	
	public function getHandle($handleName) {
		$xmls = $this->getAsSxe()
			->xpath($handleName);
		
		if (isset($xmls[0]) AND $xmls[0] instanceof SimpleXMLElement) {
			$xml = $xmls[0];
		} else {
			$xml = $this->getAsSxe()->addChild($handleName);
		}
		
		return $xml;
	}
	
	/**
	 * Get Reference SimplXMLElement object
	 * 
	 * @return SimpleXMLElement
	 */
	public function getReference(SimpleXMLElement $handle, $referenceName) {
		$xmls = $handle->xpath('reference[@name="' . $referenceName . '"]');
		
		if (isset($xmls[0]) AND $xmls[0] instanceof SimpleXMLElement) {
			$xml = $xmls[0];
		} else {
			$xml = $handle->addChild('reference');
			$xml->addAttribute('name', $referenceName);
		}
		
		return $xml;
	}
	
	public function addRemove($handleName, $referenceName, $name)
	{
		$handle = $this->getHandle($handleName);
		$reference = $this->getReference($handle, $referenceName);
		
		$removeXml = $reference->addChild('remove');
		$removeXml->addAttribute('name', $name);
		
		return $this;
	}
	
	public function addMove($handleName, array $referenceNamesFrom = array(), $referenceNameTo, $name)
	{
		$handle = $this->getHandle($handleName);
		$referenceFrom = $this->getReference($handle, $referenceNamesFrom[0]);
		$referenceTo = $this->getReference($handle, $referenceNameTo);
		
		if ($referenceNamesFrom[0] !== $referenceNameTo) {
			$unsetXml = $referenceFrom->addChild('action');
			$unsetXml->addAttribute('method', 'unsetChild');
			$unsetXml->addChild('name');
			$unsetXml->name = $name;
			
			$insertXml = $referenceTo->addChild('action');
			$insertXml->addAttribute('method', 'insert');
			$insertXml->addChild('name');
			$insertXml->name = $name;
		}
		
		return $this;
	}
	
	public function removeMove($handleName, array $referenceNames = array(), $name)
	{
		$handle = $this->getHandle($handleName);
		
		foreach($referenceNames as $referenceName) {
			$reference = $this->getReference($handle, $referenceName);
			
			foreach ($reference->action as $action) {
				if ($action['method'] == 'unsetChild' AND $action->name == $name) {
					$dom = dom_import_simplexml($action);
					$dom->parentNode->removeChild($dom);
				}
				elseif ($action['method'] == 'insert' AND $action->name == $name) {
					$dom = dom_import_simplexml($action);
					$dom->parentNode->removeChild($dom);
				}
			}
		}
		
		return $this;
	}
	
	public function save()
	{
		return $this->putContents($this->sxe->asNiceXml());
	}
}