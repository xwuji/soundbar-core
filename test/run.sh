#!/bin/bash
publishDir='dist'
publishFile='index.js'
__DIR__=$(dirname "$0")

printTestOut(){
for file in $(ls $__DIR__/exe)
  do
    bfilename=`basename ${file} .js`
    if [ -d "${__DIR__}/printout" ]
    then
    node "${__DIR__}/exe/${bfilename}.js" > "${__DIR__}/printout/print_${bfilename}.json"
    else
    echo "=> Creating 'printout' file directory"
    mkdir "${__DIR__}/printout"
    node "${__DIR__}/exe/${bfilename}.js" > "${__DIR__}/printout/print_${bfilename}.json"
    fi
    echo "=> print_${bfilename}.json is Completed🎉"
  done
}

cd ${__DIR__}
cd '..'


echo "====== Starting shell script ======"
# startTimes=`date +%s`
if [[ -d "./${publishDir}" && -f "./${publishDir}/${publishFile}" ]]
then
  printTestOut
else
  echo "=> Lack of package, building dist/index.js"
  npm run build && printTestOut
fi
# endTimes=`date +%s`
# sumTime=`expr $endTimes - $startTimes`
echo "====== Finished💫💫💫，Please check the results over ${__DIR__} ======"