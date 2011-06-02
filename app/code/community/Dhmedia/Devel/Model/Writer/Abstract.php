<?php

abstract class Dhmedia_Devel_Model_Writer_Abstract
{
	protected $path;
	
	public function __construct($path=null)
	{
		$this->path = $path;
	}
	
	public function getContents()
	{
		return file_get_contents($this->path);
	}
	
	public function setContents($contents)
	{
		return file_put_contents($this->path, $contents);
	}
}