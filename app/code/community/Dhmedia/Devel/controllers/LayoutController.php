<?php

class Dhmedia_Devel_LayoutController extends Mage_Core_Controller_Front_Action
{
	public function removeAction()
	{
		$form = new Zend_Form();
		$form->setView(new Zend_View());
		$form->setMethod('post');
		$form->setAction('');
		$form->setAttrib('class', 'devel');
		$form->setAttrib('title', 'Remove wizard - ' 
			. $this->getRequest()->getParam('name')
		);
		
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
			'description' => 'NOTE: These are the handles that this block appears in: ' 
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
			
			die('DONE. You need to reload to see changes!');
		}
		else {
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
	
	public function moveAction()
	{
		$form = new Zend_Form();
		$form->setView(new Zend_View());
		$form->setMethod('post');
		$form->setAction('');
		$form->setAttrib('class', 'devel');
		$form->setAttrib('title', 'Move wizard - ' 
			. $this->getRequest()->getParam('name')
		);
		
		$handleOptions = explode(',', $this->getRequest()->getParam('handles'));
		$handleOptionsUsed = explode(',', $this->getRequest()->getParam('handles_used'));
		$regionOptions = explode(',', $this->getRequest()->getParam('regions'));
		
		$handleOptionsHidden = $form->createElement('hidden', 'handles', array(
			'decorators' => array('ViewHelper')
		));
		$handleOptionsUsedHidden = $form->createElement('hidden', 'handles_used', array(
			'decorators' => array('ViewHelper')
		));
		$regionOptionsHidden = $form->createElement('hidden', 'regions', array(
			'decorators' => array('ViewHelper')
		));
		
		$references = $form->createElement('hidden', 'references', array(
			'decorators' => array('ViewHelper'),
			'required' => true
		));
		
		$region = $form->createElement('radio', 'region', array(
			'label' => 'Region',
			'required' => true,
			'multiOptions' => array_combine($regionOptions,$regionOptions)
		));
		
		$handle = $form->createElement('radio', 'handle', array(
			'label' => 'Handle',
			'required' => true,
			'multiOptions' => array_combine($handleOptions,$handleOptions),
			'description' => 'NOTE: This are the handles that this block appears in: ' 
				. $this->getRequest()->getParam('handles_used')
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
			$handleOptionsUsedHidden,
			$regionOptionsUsedHidden,
			
			$references,
			$region,
			$handle,
			$name,
			$submit
		));
		
		if ($form->isValid($this->getRequest()->getParams())) {
			$localXmlWriter = Mage::getModel('devel/writer_localxml');
			$localXmlWriter->removeMove(
				$form->handle->getValue(),
				explode(',', $form->references->getValue()),
				$form->name->getValue()
			);
			$localXmlWriter->addMove(
				$form->handle->getValue(),
				explode(',', $form->references->getValue()),
				$form->region->getValue(),
				$form->name->getValue()
			);
			
			$localXmlWriter->save();
			
			die('DONE. You need to reload to see changes!');
		}
		else {
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