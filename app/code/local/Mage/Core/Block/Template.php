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

        $includeFilePath = realpath($this->_viewDir . DS . $fileName);
        
        if (!$do) {
            ob_start();
        }
        if ($this->getShowTemplateHints()) {
            echo '<div class="devel-hint">';
            echo '<div class="hints" style="display:none;">';
            
            // Template hint
            $dataFileinfo = Zend_Json::encode(array(
            	'filename' => $fileName,
            	'template' => $this->getTemplate(),
            	'viewPath' => $this->_viewDir,
            	'path' => $includeFilePath
            ));
            $dataEditor = Zend_Json::encode(array(
            	'url' => Mage::getBaseUrl() . 'devel/filesystem/edit/type/template?template=' . urlencode($this->getTemplate())
            ));
            echo '<div class="hint template-hint" rel="template" title="'.$fileName.'">';
            	echo $fileName;
            	echo '<span class="hide" rel="fileinfo">';
                	echo $dataFileinfo;
                echo '</span>';
                echo '<span class="hide" rel="editor">';
                	echo $dataEditor;
                echo '</span>';
            echo '</div>';
            
            // Block hint
            if (self::$_showTemplateHintsBlocks) {
                $thisClass = get_class($this);
                $dataVars = Zend_Json::encode(get_defined_vars());
                $dataThis = Zend_Json::encode(get_object_vars($this));
                $dataMethods = Zend_Json::encode(get_class_methods($this));
                $dataDocs = Zend_Json::encode(array(
                	'url' => $this->getDocsUrl()
                ));

                /* Detect xml layouts - START */
                $layout = Mage::getSingleton('core/layout');
                $update = $layout->getUpdate();
                $xml = $update->asSimplexml();
                
                $xmlLayoutData = array();
                
                $dresults = $xml->xpath('//devel[xml//@name="' . $this->getNameInLayout() . '"]');
                
                //echo "\n\nXPATH\n\n";
                //echo $this->getNameInLayout() . "\n\n";
                foreach($dresults as $dresult) {
                	//echo 'FILE: ' . $dresult->file . "\n";
                	
                	$_xmlLayoutData = array(
                		'file' => (string) $dresult->file,
                		'path' => (string) $dresult->filename,
                		'url' => Mage::getBaseUrl() . 'devel/filesystem/edit/type/layout?layout=' . urlencode($dresult->file),
                		'xml' => array()
                	);
                	
                	$res = $dresult->xpath('xml//*[@name="' . $this->getNameInLayout() . '"]');
                	foreach($res as $r) {
                		//echo $r->asXML() . "\n";
                		$_xmlLayoutData['xml'][] = $this->protectXmlInJson($r->asXML());
                	}
                	
                	$xmlLayoutData[] = $_xmlLayoutData;
                }
                
                $dataLayout = Zend_Json::encode($xmlLayoutData);
				/* Detect xml layouts - END */
                
                //$this->allowRenderView(false);
                //$dataReflect = Zend_Json::encode($this->buildReflect($this));
                //$this->allowRenderView(true);
                
                echo '<div class="hint block-hint" rel="block" title="'.$thisClass.'">';
                	echo $thisClass;
                	echo '<span class="hide" rel="this">';
                		echo $dataThis;
                	echo '</span>';
                	echo '<span class="hide" rel="vars">';
                		echo $dataVars;
                	echo '</span>';
                	echo '<span class="hide" rel="methods">';
                		echo $dataMethods;
                	echo '</span>';
                	echo '<span class="hide" rel="docs">';
                		echo $dataDocs;
                	echo '</span>';
                	echo '<span class="hide" rel="reflect">';
                		//echo $dataReflect;
                	echo '</span>';
                	echo '<span class="hide" rel="layout">';
                		echo $dataLayout;
                	echo '</span>';
                echo '</div>';
                
                if (count($this->_viewVars) AND function_exists('krumo')) {
                	echo '<div class="hint block-hint" rel="block" title="'.$thisClass.'">';
                	krumo($this->_viewVars);
                	echo '</div>';
                }
            }
            echo '</div>';
        }

        try {
            if (strpos($includeFilePath, realpath($this->_viewDir)) === 0) {
                include $includeFilePath;
            } else {
                Mage::log('Not valid template file:'.$fileName, Zend_Log::CRIT, null, null, true);
            }

        } catch (Exception $e) {
            ob_get_clean();
            throw $e;
        }

        if ($this->getShowTemplateHints()) {
            echo '</div>';
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
//    	if (! $this->allowRenderView()) {
//    		return;
//    	}
    	
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
//   		foreach($reflectionClass->getMethods() as $method) {
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

    	protected function protectXmlInJson($xml)
    	{
    		$xml = str_replace('<', '[[', $xml);
    		$xml = str_replace('>', ']]', $xml);
    		$xml = str_replace('"', "''", $xml);
    		
    		return $xml;
    	}
}
