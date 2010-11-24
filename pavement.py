from paver.easy import *
import string
import re
import sys
import subprocess
from datetime import date

deployDir = path("deploy")
srcDir = path("src")
buildDir = srcDir / "build"
sys.path.append(buildDir.abspath())
from buildconfig import loadConf

options(
        version=sh("git describe --tags",capture=True).strip(),
        version_date=date.today(),
        targetEnv="local"
        )

@task 
def auto(): 
    "runs on every paver call"
    loadConf(options)     
    options.version_name=options.version.replace(".","-") + (options.debug and "-dev" or "")

@task
def build():
    "transform source code into a deployable google app"
    def combine(mediaPath, in_files, out_file, in_type='js'):
        "combine text files into one"
        out = open(mediaPath / ('%s.%s' % (out_file,in_type)), 'w')
        for f in in_files:
            f=mediaPath / ('%s.%s'%(f,in_type))
            with open(f) as fh:
                data = fh.read() + '\n'
            f.remove()
            out.write(data)
            print ' + %s' % f
        out.close()
    def configureFiles():
        """in all code files in the deploy directory, substitute strings of format 
        $CONF_[a key from pavement options] with the option's value"""
        def applyConfig(curPath):
            for f in [a for a in curPath.files() if re.search("\.(yaml|js|html|djml|css|py)$",a)]:
                with open(f,'r') as fh:
                    subbed=string.Template(fh.read()).safe_substitute(config)
                with open(f,'w') as fh:
                    fh.write(subbed)
            for d in curPath.dirs():
                applyConfig(d)
        config=dict([("CONF_%s" % k,v) for (k,v) in options.iteritems()])
        applyConfig(deployDir)
    deployDir.rmtree()
    mediaDir=deployDir/"media"
    (srcDir / "content").copytree(deployDir / "content")
    (srcDir / "media").copytree(mediaDir)
    (buildDir / "htaccess").copy(deployDir / ".htaccess")
    (mediaDir / "data" / "robots.txt").copy(deployDir / "robots.txt")
    (mediaDir / "images" / "favicon.ico").copy(deployDir / "favicon.ico")
    options.update(options.get(options.targetEnv))
    configureFiles()
    combineName='app-%s' % options.version_name
    combine(mediaDir/"js",
            [
             'jquery.textchange.min',
             'jquery.ba-hashchange.min',
             'hex'
             ],combineName)

@task
def setlive():
    options.targetEnv="live"

@task
@needs('setlive','build')
def deploy():
    "put the current application live"