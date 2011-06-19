<?php

abstract class Dhmedia_Devel_Model_File_Abstract
{	
	protected $shortPath;
	
	protected $errors = array();
	
	abstract public function getType();
	abstract public function getUseThemeError();
	abstract public function getDefaultContents();
	
	public function __construct()
	{
		$this->shortPath = func_get_arg(0);
		
		if (! $this->shortPath) {
			throw new Exception("Missing shortpath in constructor");
		}
		
		$this->isEditable(); // run here to populate errors
	}
	
	public function __($string)
	{
		return Mage::getSingleton('core/translate')->translate(array($string));
	}
	
	public function isEditable()
	{
		/*
		 * Check we have a custom theme
		 */
		if (Mage::getDesign()->getDefaultTheme() == Mage::getDesign()->getTheme('')) {
			$learnLink = Mage::getBaseUrl() . 'devel/help/view?' . http_build_query(array(
				'topic' => 'theme/create_custom'
			)); 
			$this->addError($this->__('You need to create a custom theme! <a class="devel-help" href="' . $learnLink . '">Learn more</a>'));
			return false;
		}
		
		if (! $this->exists() AND !$this->create()) {
			return false;
		}
		
		if (! $this->isThemeFile()) {
			return false;
		}
		
		if (! $this->isWriteable()) {
			return false;
		}
		
		return true;
	}
	
	/**
	 * Check file is in custom theme
	 */
	public function isThemeFile()
	{
		if (! file_exists($this->getThemePath())) {
			$this->addError($this->__($this->getUseThemeError()));
			return false;
		}
		
		return true;
	}
	
	public function exists()
	{
		return file_exists($this->getPath());
	}
	
	/**
	 * Check file is writeable
	 */
	public function isWriteable()
	{
		if (! is_writeable($this->getPath())) {
			$this->addError($this->__("File is not writeable!"));
			return false;
		}
		
		return true;
	}
	
	public function addError($error)
	{
		if (!in_array($error, $this->errors)) {
			$this->errors[] = $error;
		}
		
		return $this; //chainable
	}
	
	public function hasErrors()
	{
		return (bool) count($this->errors);
	}
	
	public function getErrors()
	{
		return $this->errors;
	}
	
	public function clearErrors()
	{
		$this->errors = array();
		
		return $this; //chainable
	}
	
	public function getUid()
	{
		return fileowner($this->getPath());
	}
	
	public function getMode()
	{
		return substr(sprintf('%o', fileperms($this->getPath())), -4);
	}
	
	public function getShortPath()
	{
		return $this->shortPath;
	}
	
	public function getPath()
	{
		return Mage::getDesign()->getFilename($this->getShortPath(), array(
			'_type' => $this->getType()
		));
	}
	
	protected function buildPath(array $params=array())
	{
		if (! isset($params['_type'])) {
			$params['_type'] = $this->getType();
		}
		
		if (! isset($params['_theme'])) {
			$params['_theme'] = Mage::getDesign()->getTheme($this->getType());
		}

		return Mage::getDesign()->getBaseDir($params) . DS . $this->getShortPath();
	}
	
	public function getDefaultPath()
	{
		return $this->buildPath(array(
			'_type' => $this->getType(),
			'_theme' => Mage::getDesign()->getDefaultTheme()
		));
	}
	
	public function getThemePath()
	{
		return $this->buildPath(array(
			'_type' => $this->getType(),
			'_theme' => Mage::getDesign()->getFallbackTheme()
		));
	}
	
	public function getContents()
	{
		return file_get_contents($this->getPath());
	}
	
	public function putContents($contents)
	{
		if (! $this->isEditable()) {
			return false;
		}
		
		return file_put_contents($this->getPath(), $contents);
	}
	
	protected function mkdir($dirPath) {
		if (file_exists($dirPath)) {
			if (! is_writeable($dirPath)) {
				$this->addError($this->__("Folder is not writeable!"));
				return false;
			}
		}
		else {
			if (! mkdir($dirPath, 0777, true)) {
				$this->addError($this->__("Could not create folder!"));
				return false;
			}
		}
		
		return true;
	}
	
	protected function chmod($path) {
		if (! chmod($path, 0777)) {
			$this->addError($this->__("Could not chmod file!"));
			// DO NOT RETURN FALSE!!!
		}
		
		return true;
	}
	
	public function copyTo($destination)
	{
		if (! $this->mkdir(dirname($destination)))
			return false;
		
		if (! copy($this->getPath(), $destination)) {
			$this->addError($this->__("Could not copy file!"));
			return false;
		}
		
		$this->chmod($destination);
		
		return true;
	}
	
	public function create()
	{
		$dirPath = dirname($this->getThemePath());
		
		if (! $this->mkdir($dirPath))
			return false;
		
		$contents = $this->getDefaultContents();
		
		if (! file_put_contents($this->getThemePath(), $contents)) {
			$this->addError($this->__("Could not write to file!"));
			return false;
		}
		
		$this->chmod($this->getThemePath());
		
		return true;
	}
}