<?php
include('../config.php'); 

class NoteIO 
{
    private const NOTEFOLDER = "../notes/";  

    private $errorMsg = "The maximum value of files in notes folder is reached";
    private $fileNotReadMsg = "File could not be saved, internal server error!"; 
    private $deleteMsg = "File has been deleted!";
    private $fileNotFoundMsg = "File could not be found!"; 
    private $noteName; 
    private $path; 

    function __construct($name) {
        $this->noteName = $name; 
        $this->path = self::NOTEFOLDER . $this->noteName . ".txt"; 
    }

    private function countNotes() {
        $noteCount = new FilesystemIterator(self::NOTEFOLDER, FilesystemIterator::SKIP_DOTS);
        return iterator_count($noteCount); 
    }

    public function getNoteName() {
        return $this->noteName; 
    }

    public function setNoteName($name) {
        $this->noteName = $name; 
    }

    public function writeNote($text)
    {
        if (!empty($text) || !isset($text)) {
            $fileNums = $this->countNotes();
            if ($fileNums < 200) {
                $note = fopen($this->path, "w");
                if(!fwrite($note, $text)) {
                    print($this->fileNotReadMsg);
                }
                fclose($note); 
            } else {
                print($this->errorMsg);
            }   
        }
        print("File has been saved!");
    }

    public function readNote()
    {
        $text = "";
        if(file_exists($this->path)) {
            $note = fopen($this->path, "r");
            while(!feof($note)) {
                $text = $text . fgets($note);
            }
            fclose($note);  
            print($text); 
        } else {
            print($this->fileNotFoundMsg); 
        } 
    }

    public function renameNote($name) 
    {

    }

    public function deleteNote() 
    {
        print("test");
        if(file_exists($this->path)) {
            unlink($this->path); 
            print($this->deleteMsg); 
        } else {
            print("This file does not exist!"); 
        }
    }

    public function listNotes() 
    {
        $notes = preg_grep('/^([^.])/', scandir(self::NOTEFOLDER)); 
        foreach($notes as &$value) {
            $value = substr($value, 0, -4); 
        } 
        $string = "";
        foreach($notes as $value) {
            $string = $string . '<a href="#" class="noteLoad">' . $value . '</a><br>' . ";";  
        }
        $string = substr($string, 0, strlen($string)-1);
        $rpos = strrpos($string, ";"); 
        $string = substr($string, 0, $rpos); 
        print($string); 
    }
}

// testing area:
//$n = new NoteIO("");
//$n->listNotes(); 
?>

