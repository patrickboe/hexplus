hexpl.us
Copyright (c) 2010 Patrick Boe  
Version: 0.1 (11/21/2010)  
Dual licensed under the MIT and GPL licenses:  
http://www.opensource.org/licenses/mit-license.php  
http://www.gnu.org/licenses/gpl.html

##Set Up a Dev Environment
Clone the repository, then change to the project's src/build directory.

You need Paver and pyYAML. To install what you don't have yet, run:

	pip install -r requirements.txt

Make a copy of `/src/build/my_example.yaml` named `my.yaml`. Customize it for your environment.
 
##Build
	
from the project root do:
	
	paver build
	
This puts a local-runnable site in your deploy directory.
 
##Deploy
	
	paver deploy
	
This puts a deployable site in your deploy directory.