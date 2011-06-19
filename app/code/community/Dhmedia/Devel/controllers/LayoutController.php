<?php

class Dhmedia_Devel_LayoutController extends Mage_Core_Controller_Front_Action
{
	public function removeAction() {
		$form = new Zend_Form();
		$form->setView(new Zend_View());
		$form->setMethod('post');
		$form->setAction('');
		$form->setAttrib('class', 'devel');
		$form->setAttrib('title', 'Remove wizard');
		
		$handleOptions = explode(',', $this->getRequest()->getParam('handles'));
		$referenceOptions = explode(',', $this->getRequest()->getParam('references'));
		$handleOptionsUsed = explode(',', $this->getRequest()->getParam('handles_used'));
		
		$handleOptionsHidden = $form->createElement('hidden', 'handles', array(
			'decorators' => array('ViewHelper')
		));
		$referenceOptionsHidden = $form->createElement('hidden', 'references', array(
			'decorators' => array('ViewHelper')
		));
		$handleOptionsUsedHidden = $form->createElement('hidden', 'handles_used', array(
			'decorators' => array('ViewHelper')
		));
		
		$handle = $form->createElement('radio', 'handle', array(
			'label' => 'Handle',
			'required' => true,
			'multiOptions' => array_combine($handleOptions,$handleOptions),
			'description' => 'NOTE: This are the handles that this block appears in: ' 
				. $this->getRequest()->getParam('handles_used')
		));
		
		$reference = $form->createElement('radio', 'reference', array(
			'label' => 'Reference',
			'required' => true,
			'multiOptions' => array_combine($referenceOptions,$referenceOptions)
		));
		
		$name = $form->createElement('text', 'name', array(
			'label' => 'Name',
			'required' => true
		));
		$submit = $form->createElement('submit', 'submit', array(
			'label' => 'Submit'
		));

		$form->addElements(array(
			$handleOptionsHidden,
			$referenceOptionsHidden,
			$handleOptionsUsedHidden,
			
			$handle,
			$reference,
			$name,
			$submit
		));
		
		if ($form->isValid($this->getRequest()->getParams())) {
			
			$localXmlWriter = Mage::getModel('devel/writer_localxml');
			$localXmlWriter->addRemove(
				$form->handle->getValue(),
				$form->reference->getValue(),
				$form->name->getValue()
			);
			
			$localXmlWriter->save();
			
			die('DONE');
			
		} else {
			$this->loadLayout();
			$this->getLayout()->getUpdate()
				->load('devel_layout_wizard');
			$this->getLayout()->generateXml();
			$this->loadLayout();
			
			$this->getLayout()->getBlock('devel_wizard_form')
				->setForm($form);
			$this->renderLayout();	
		}
	}
}