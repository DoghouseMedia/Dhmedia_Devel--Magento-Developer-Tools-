<?php

class Dhmedia_Devel_FilesystemController extends Mage_Core_Controller_Front_Action
{
	public function editAction()
	{
		if ($this->getRequest()->isPost())
		{
			$type = $this->getRequest()->getParam('type');
			
			$file = Mage::getModel('devel/file_' . $type,
				$this->getRequest()->getParam($type)
			);
		
			$code = $this->getRequest()->getParam('code');
			
			if ($file->putContents($code)) {
				Mage::getSingleton('core/session')->addSuccess($this->__("File written successfully!"));
			}
			
			foreach ($file->getErrors() as $error) {
				Mage::getSingleton('core/session')->addError($error);
			}
			
			$this->_redirect('*/*/*', array(
				'_query' => array($type => $file->getShortPath(), 'type' => $type)
			));
		} 
		else
		{
			$this->loadLayout()
				->getLayout()->getBlock('head')->setTitle($this->__('Filesystem Editor'));
			$this->renderLayout();
		}
	}
	
	public function copyAction()
	{
		$type = $this->getRequest()->getParam('type');
		
		$file = Mage::getModel('devel/file_' . $type,
			$this->getRequest()->getParam($type)
		);
		
		$file->clearErrors(); // clear messages added by file checks
		
		$destination = $this->getRequest()->getParam('destination');
		
		if ($file->copyTo($destination)) {
			Mage::getSingleton('core/session')->addSuccess($this->__("File copied successfully!"));
		}
		
		foreach ($file->getErrors() as $error) {
			Mage::getSingleton('core/session')->addError($error);
		}
		
		$this->_redirect('*/*/edit', array(
			'_query' => array($type => $file->getShortPath(), 'type' => $type)
		));
	}
}