<?php

class Dhmedia_Devel_Helper_Config extends Mage_Core_Helper_Abstract
{
	public function isDevelMode()
	{
		return Mage::helper('devel/auth')->allowDevel();
	}
	
	public function stringToArray($dotSeparatedString, $value)
	{
		$array = array();
		$currentArrayPointer =& $array;
		
		$parts = explode('.', $dotSeparatedString);
		
		while($part = array_shift($parts)) {
			$currentArrayPointer[$part] = array();
			$currentArrayPointer =& $currentArrayPointer[$part];
		}
		
		$currentArrayPointer = $value;
		
		return $array;
	}
}