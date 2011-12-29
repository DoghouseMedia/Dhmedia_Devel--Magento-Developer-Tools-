<?php

class Dhmedia_Devel_Helper_Url extends Mage_Core_Helper_Url
{
	public function getUrl($develPath, array $params = null)
	{
		$url = Mage::getBaseUrl() . 'devel/' . $develPath;
		
		if (is_array($params) AND count($params)) {
			$url .= '?' . http_build_query($params); 
		}
		
		return $url;
	}
	
	public function getUrlReturn($develPath, $returnUrl=null)
	{
		if (! $returnUrl) {
			$returnUrl = $this->getCurrentUrl();
		}
		
		return $this->getUrl($develPath, array(
			'return' => $returnUrl
		));
	}
	
	public function getHelpUrl($topic)
	{
		return $this->getUrl('help/view', array(
			'topic' => $topic
		));
	}
	
	public function getEditUrl($type, $path)
	{
		return $this->getUrl('filesystem/edit', array(
			'type' => $type,
			'layout' => $path
		));
	}
	
	public function getCurrentUrl()
	{
		$request = Mage::app()->getRequest();

		$url = $request->getScheme() . '://' . $request->getHttpHost();

		if ($request->getServer('SERVER_PORT') != '80') {
			$url .= ':' . $request->getServer('SERVER_PORT');
		} 

		$url .= $request->getServer('REQUEST_URI');

		return $url;
	}
	public function getAdminUrl()
	{
		return Mage::getModel('adminhtml/url')->getUrl('adminhtml');
	}
}