<?php
/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    Mage
 * @package     Mage_Core
 * @copyright   Copyright (c) 2010 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */


/**
 * Base html block
 *
 * @category   Mage
 * @package    Mage_Core
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Core_Block_Template extends Mage_Core_Block_Abstract
{

//	protected static $allowRenderView = true;
	
    /**
     * View scripts directory
     *
     * @var string
     */
    protected $_viewDir = '';

    /**
     * Assigned variables for view
     *
     * @var array
     */
    protected $_viewVars = array();

    protected $_baseUrl;

    protected $_jsUrl;

    protected static $_showTemplateHints;
    protected static $_showTemplateHintsBlocks;

    /**
     * Path to template file in theme.
     *
     * @var string
     */
    protected $_template;

    /**
     * Internal constructor, that is called from real constructor
     *
     */
    protected function _construct()
    {
        parent::_construct();

        /*
         * In case template was passed through constructor
         * we assign it to block's property _template
         * Mainly for those cases when block created
         * not via Mage_Core_Model_Layout::addBlock()
         */
        if ($this->hasData('template')) {
            $this->setTemplate($this->getData('template'));
        }
    }

    /**
     * Get relevant path to template
     *
     * @return string
     */
    public function getTemplate()
    {
        return $this->_template;
    }

    /**
     * Set path to template used for generating block's output.
     *
     * @param string $template
     * @return Mage_Core_Block_Template
     */
    public function setTemplate($template)
    {
        $this->_template = $template;
        return $this;
    }

    /**
     * Get absolute path to template
     *
     * @return string
     */
    public function getTemplateFile()
    {
        $params = array('_relative'=>true);
        $area = $this->getArea();
        if ($area) {
            $params['_area'] = $area;
        }
        $templateName = Mage::getDesign()->getTemplateFilename($this->getTemplate(), $params);
        return $templateName;
    }

    /**
     * Get design area
     * @return string
     */
    public function getArea()
    {
        return $this->_getData('area');
    }

    /**
     * Assign variable
     *
     * @param   string|array $key
     * @param   mixed $value
     * @return  Mage_Core_Block_Template
     */
    public function assign($key, $value=null)
    {
        if (is_array($key)) {
            foreach ($key as $k=>$v) {
                $this->assign($k, $v);
            }
        }
        else {
            $this->_viewVars[$key] = $value;
        }
        return $this;
    }

    /**
     * Set template location dire
     *
     * @param string $dir
     * @return Mage_Core_Block_Template
     */
    public function setScriptPath($dir)
    {
        $this->_viewDir = $dir;
        return $this;
    }

    /**
     * Check if dirrect output is allowed for block
     * @return bool
     */
    public function getDirectOutput()
    {
        if ($this->getLayout()) {
            return $this->getLayout()->getDirectOutput();
        }
        return false;
    }

    public function getShowTemplateHints()
    {
        if (is_null(self::$_showTemplateHints)) {
            self::$_showTemplateHints = Mage::getStoreConfig('dev/debug/template_hints')
                && Mage::helper('core')->isDevAllowed();
            self::$_showTemplateHintsBlocks = Mage::getStoreConfig('dev/debug/template_hints_blocks')
                && Mage::helper('core')->isDevAllowed();
        }
        return self::$_showTemplateHints;
    }

    /**
     * Retrieve block view from file (template)
     *
     * @param   string $fileName
     * @return  string
     */
    public function fetchView($fileName)
    {
        Varien_Profiler::start($fileName);

        // EXTR_SKIP protects from overriding
        // already defined variables
        extract ($this->_viewVars, EXTR_SKIP);
        $do = $this->getDirectOutput();
        
        if (!$do) {
            ob_start();
        }
        if ($this->getShowTemplateHints()) {
            echo '<div class="devel-hint">';
        }

        $exception = null;
        $includeFilePath = realpath($this->_viewDir . DS . $fileName);
        
        try {
            if (strpos($includeFilePath, realpath($this->_viewDir)) === 0) {
                include $includeFilePath;
            } else {
                Mage::log('Not valid template file:'.$fileName, Zend_Log::CRIT, null, null, true);
            }

        } catch (Exception $e) {
            ob_get_clean();
            $exception = $e;
        }

        if ($this->getShowTemplateHints()) {
        	echo '<div class="hints" title="' 
        		. get_class($this) 
        		. '" style="display:none;">';
            
        	echo '<div class="tooltip">Inspect &laquo;' . $this->getNameInLayout() . '&raquo;</div>';
        	
        	/*
        	 * Devel DATA
        	 */
        	echo $this->getDevelHintDataAsHtml(array(
            	'filename' => $fileName,
            	'template' => $this->getTemplate(),
            	'viewPath' => $this->_viewDir,
            	'path' => $includeFilePath,
            	'editorUrl'=> Mage::getBaseUrl() 
            		. 'devel/filesystem/edit/type/template?template=' 
            		. urlencode($this->getTemplate()),
            		
            	'xmlLayout' => $this->getDevelDataXmlLayout(),
            		
            	'className' => get_class($this),
            	'classMethods' => $this->getDevelDataClassMethods(),
            	/*
            	 * @todo
            	 * classVars break display since we moved them to after the include.
            	 * There probably tons of tasty info here!
            	 */
            	//'classVars' => get_object_vars($this),
            	'localVars' => get_defined_vars(),
            	'classDocsUrl' => $this->getDocsUrl(),
            	/*
            	 * Was trying to recurse all object/properties/methods of block.
            	 * Never worked.  Start by figuring out what's in 'classVars'.
            	 * @see self::getDevelDataClassReflectAll()
            	 */
            	//'classReflectAll' => $this->getDevelDataClassReflectAll(),
            	
            	'nameInLayout' => $this->getNameInLayout(),
            	'wizardRemove' => array(
            		'url' => '/devel/layout/remove',
            		'params' => array(
            			'name' => $this->getNameInLayout()
            		),
            		'title' => 'Remove ' . $this->getNameInLayout()
           		),
            	'handles' => $this->getLayout()->getUpdate()->getHandles()
            ));

            /*
             * Krump hint
             * 
             * Krumo hints is special since it doesn''t return but echoes.
             * We could handle this with output buffering, but we would have to detect
             * whether or not it was already on.
             */
            if (function_exists('krumo')) :  
	            echo '<div class="hint" rel="Krumo">';
	            	echo '<span class="devel-data-json">';
	            	krumo($this->_viewVars);
	            	echo '</span>';
	            echo '</div>';
            endif;
            
            /*
             * Close HINTS
             */
            echo '</div>'; // close .hints
            echo '</div>'; // close .devel-hint
        }

        if ($exception) {
        	throw $exception;
        }
        
        if (!$do) {
            $html = ob_get_clean();
        } else {
            $html = '';
        }
        Varien_Profiler::stop($fileName);
        return $html;
    }

    /**
     * Render block
     *
     * @return string
     */
    public function renderView()
    {
    	/*
    	 * @see self::getDevelDataClassReflectAll()
    	 */
		//if (! $this->allowRenderView()) {
		//	return;
		//}
    	
        $this->setScriptPath(Mage::getBaseDir('design'));
        $html = $this->fetchView($this->getTemplateFile());
        
        return $html;
    }

    /**
     * Render block HTML
     *
     * @return string
     */
    protected function _toHtml()
    {
        if (!$this->getTemplate()) {
            return '';
        }
        $html = $this->renderView();
        return $html;
    }

    /**
     * Get base url of the application
     *
     * @return string
     */
    public function getBaseUrl()
    {
        if (!$this->_baseUrl) {
            $this->_baseUrl = Mage::getBaseUrl();
        }
        return $this->_baseUrl;
    }

    /**
     * Get url of base javascript file
     *
     * To get url of skin javascript file use getSkinUrl()
     *
     * @param string $fileName
     * @return string
     */
    public function getJsUrl($fileName='')
    {
        if (!$this->_jsUrl) {
            $this->_jsUrl = Mage::getBaseUrl('js');
        }
        return $this->_jsUrl.$fileName;
    }

    /**
     * Get data from specified object
     *
     * @param Varien_Object $object
     * @param string $key
     * @return mixed
     */
    public function getObjectData(Varien_Object $object, $key)
    {
        return $object->getDataUsingMethod((string)$key);
    }

    /**
     * Get cache key informative items
     *
     * @return array
     */
    public function getCacheKeyInfo()
    {
        return array(
            'BLOCK_TPL',
            Mage::app()->getStore()->getCode(),
            $this->getTemplateFile(),
            'template' => $this->getTemplate()
        );
    }
    
    /* -----| Dhmedia Devel |----- */
    public function getDocsUrl()
    {
    	$className = get_class($this);
    	$classNameParts = explode('_', $className);
    	
    	if ($classNameParts[0] == 'Mage') {
    		return 'http://docs.magentocommerce.com/Mage_' . $classNameParts[1] . '/' . $className . '.html';
    	}
    	else {
    		return 'http://www.google.com.au/search?q=' . urlencode('magento documentation ' . $className);
    	}
    }
    
    public function getDevelDataXmlLayout()
    {
    	$xml = Mage::getSingleton('core/layout')
    		->getUpdate()
    		->asSimpleXml();

        $data = array();

        $xpathQueries = array(
        	'develRefs' => '//devel[xml//@name="' . $this->getNameInLayout() . '"]',
        	'keyRefs' => 'xml/*[.//@name="' . $this->getNameInLayout() . '"]',
        	'relativeRefs' => './/*[@name="' . $this->getNameInLayout() . '"]'
        );

        foreach($xml->xpath($xpathQueries['develRefs']) as $resDevel) {
        	//$data[] = $resDevel->getName();
	        foreach($resDevel->xpath($xpathQueries['keyRefs']) as $resKey) {
	            $_data = array(
	            	'file' => (string) $resDevel->file,
	               	'path' => (string) $resDevel->filename,
	              	'url' => Mage::getBaseUrl() 
	            		. 'devel/filesystem/edit/type/layout?layout=' 
						. urlencode($resDevel->file),
	               	'xml' => array(),
					'handle' => $resKey->getName(),
					'references' => array()
	            );
 
	            foreach($resKey->xpath($xpathQueries['relativeRefs']) as $resXml) {
	            	/*
	            	 * Get Parent tag
	            	 */
	            	$parentTagNameAttr = false;
	            	$parentsXml = $resXml->xpath('./..');
	            	$parentXml = $parentsXml[0];
	            	$parentTagOpen = '<' . $parentXml->getName();
	            	foreach($parentXml->attributes() as $k => $v) {
	            		if ($k == 'name') {
	            			$parentTagNameAttr = (string) $v;
	            		}
	            		$parentTagOpen .= ' ' . $k . '=' . '"' . $v . '"';
	            	}
	            	$parentTagOpen .= '>';
	            	$parentTagClose = '</' . $parentXml->getName() . '>';
	            	
	            	if (
	            		$parentTagNameAttr AND
	            		in_array($parentXml->getName(), array('reference','block'))
	            	) {
	            		$_data['references'][] = $parentTagNameAttr;
	            	}
	            	
					$_data['xml'][] = $this->getDevelProtectedXmlInJson(
						$parentTagOpen . "\n"
						 . "\n\t" . '...' . "\n\n"
						 . "\t" . $resXml->asXML() . "\n"
						 . "\n\t" . '...' . "\n\n"
						 . $parentTagClose
					);
	            }
	               
	           	$data[] = $_data;
	        }
        }
                
        return $data;
    }
    
	public function getDevelHintDataAsHtml($data=array(), $dataType='json')
    {
        $o = '<div class="data">';
        	switch($dataType) {
        		case 'html': $o .= $data; break;
        		
        		default:
        		case 'json': $o .= Zend_Json::encode($data); break; 
        	}
        $o .= '</div>';
        
        return $o;
    }
    
    public function getDevelDataClassMethods()
    {
		$classMethods = get_class_methods($this);
		sort($classMethods);
		return $classMethods;
    }
    
    public function getDevelDataClassReflectAll()
    {
        /*
         * We were trying to cycle through all properties and methods
         * of the block, had problems with recursion and memory, and have
         * given up for the moment.
         */
        //$this->allowRenderView(false);
        //$dataReflect = Zend_Json::encode($this->buildReflect($this));
        //$this->allowRenderView(true);
        
    	return null;
    }
    
//    public function buildReflect(stdClass $class)
//    {
//    	set_error_handler(function($errno, $errstr, $errfile, $errline){
//    		//die('you mofo');
//    		echo "you mofo###";
//    	});
//    	
//    	
//    	$reflectionClass = new ReflectionClass($class);
//    	
//    	$reflect = array(
//    		'name' => $reflectionClass->getName(),
//    		'properties' => array(),
//    		'methods' => array()
//    	);
//    	
//    	foreach($reflectionClass->getProperties() as $property) {
//    		if (!$property->isPublic())
//    			continue;
//    		
//    		$value = $class->{$property->getName()};
//    		
//    		$reflect['properties'][$property->getName()] = array(
//    			'value' => is_object($value) ? 
//    				$this->buildReflect($value) : 
//    				$value,
//    		);
//    	}
//    	
//   	foreach($reflectionClass->getMethods() as $method) {
//    		if (!$method->isPublic() OR $method->isConstructor() OR $method->isDestructor() OR $method->isAbstract() OR $method->isFinal())
//    			continue;
//    		
//    		if (substr($method->getName(), 0, 1) == '_') {
//    			continue;
//    		}
//
//    		if (substr($method->getName(), 0, 3) != 'get' AND substr($method->getName(), 0, 2) != 'is') {
//    			continue;
//    		}	
//    			
//    		if ($method->getNumberOfRequiredParameters() > 0) {
//    			continue;
//    		}
//    		
//    		if ($class instanceof Varien_Simplexml_Config) {
//    			continue;
//    		}
//    		
//    		if ($method->getDeclaringClass()->getName() == 'Mage_Core_Block_Template') {
//    			continue;
//    		}
//    		
//    		//error_reporting(0);
//    		echo '<b>'. get_class($class) . '::' . $method->getName() . "</b><br />\n";
//    		
//    		try {
//    			$value = call_user_func(array($class, $method->getName()));
//    		}
//    		catch(Exception $e) {}
//    		
////			$value = get_class($class) . '::' . $method->getName();
//
//    		if (is_object($value)) {
//    			$value = $this->buildReflect($value);
//    		}
//			//$value = '!!!';
//    		 
//    		$reflect['methods'][$method->getName()] = array(
//    			'parameters' => $method->getParameters(),
//    			'value' => $value 
//    		);
//    	}
//    	
//    	return $reflect;
//    }
    
//    protected function allowRenderView($allowRenderView=null)
//    {
//    	if (is_bool($allowRenderView)) {
//    		static::$allowRenderView = $allowRenderView;
//    	}
//    	
//    	return (bool) static::$allowRenderView; 
//    }

    	protected function getDevelProtectedXmlInJson($xml)
    	{
    		$xml = str_replace('<', '[[', $xml);
    		$xml = str_replace('>', ']]', $xml);
    		$xml = str_replace('"', "''", $xml);
    		
    		return $xml;
    	}
}
