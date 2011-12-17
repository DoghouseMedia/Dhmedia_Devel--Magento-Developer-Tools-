<?php

class Dhmedia_Devel_SelfController extends Mage_Core_Controller_Front_Action
{
	const CHANEL_PACKAGE = 'connect.magentocommerce.com/community/Dhmedia_Devel';
	
	public function hasupdateAction()
	{
		chdir('downloader');

		require_once './Maged/Pear.php';
		
		$pearModel = new Maged_Model_Pear();
		
		$pearModel->pear()->run('remote-info', array(), array(self::CHANEL_PACKAGE));
        $output = $pearModel->pear()->getOutput();
        
        if (!isset($output[0]['output'])) {
        	echo 'ERROR';
        	return;
        }
        
        $versionLatest = $output[0]['output']['stable'];
        $versionInstalled = $output[0]['output']['installed'];
        
        $hasUpdate = version_compare($versionLatest, $versionInstalled);
        
        echo $hasUpdate ? 'Y' : 'N';
		return;
	}
}