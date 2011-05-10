<?php

class Dhmedia_Devel_Helper_Url extends Mage_Core_Helper_Url
{
	public function getHelpUrl($topic)
	{
		return Mage::getBaseUrl() . 'devel/help/view?' . http_build_query(array(
			'topic' => $topic
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
}