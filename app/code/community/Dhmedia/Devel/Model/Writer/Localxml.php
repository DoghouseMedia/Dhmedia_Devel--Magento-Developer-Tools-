<?php

class Dhmedia_Devel_Model_Writer_Localxml extends Dhmedia_Devel_Model_Writer_Abstract
{
	protected $sxe;
	
	public function __construct($path=null)
	{
		if ($path) {
			$this->path = $path;
		} else {
			$this->path = '';
		}
	}
	
	protected function getAsSxe() {
		if (! $this->sxe instanceof SimpleXMLElement) {
			$this->sxe = new SimpleXMLElement($this->getContents());
		}
		
		return $this->sxe;
	}
	
	public function addReference($referenceName) {
		$rootXml = $this->getAsSxe();
		$refsXml = $rootXml->xpath('reference[@name="' . $referenceName . '"]');
		
		if (isset($refsXml[0]) AND $refsXml instanceof SimpleXMLElement) {
			$refXml = $refsXml[0];
		} else {
			$refXml = $rootXml->addChild('reference');
			$refXml->addAttribute('name', $referenceName);
		}
		
		echo $refXml->asXML();
		return $this;
	}
	
	public function addRemove($referenceName, $name)
	{
		$this->addReference($referenceName);
		
		$rootXml = $this->getAsSxe();
		$refsXml = $rootXml->xpath('reference[@name="' . $referenceName . '"]');
		$removeXml = $refsXml[0]->addChild('remove');
		$removeXml->addAttribute('name', $name);
		
		return $this;
	}
	
	public function save()
	{
		return $this->setContents($this->sxe->asXML());
	}
}