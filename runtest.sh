#!/bin/bash
publishDir='dist'
publishFile='index.js'
__DIR__=$(dirname "$0")
cd ${__DIR__}
printTestOut(){
for file in $(ls $__DIR__/test/entrys)
  do
    bfilename=`basename ${file} .js`
    if [ -d "${__DIR__}/TEMP_runtest_printout" ]
    then
    node "${__DIR__}/test/entrys/${bfilename}.js" > "${__DIR__}/TEMP_runtest_printout/test_${bfilename}.json"
    else
    echo "=> Creating 'TEMP_runtest_printout' file directory"
    mkdir "${__DIR__}/TEMP_runtest_printout"
    node "${__DIR__}/test/entrys/${bfilename}.js" > "${__DIR__}/TEMP_runtest_printout/test_${bfilename}.json"
    fi
    echo "=> test_${bfilename}.json is Completed🎉"
  done
}


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
echo "====== Finished💫💫💫，Please check the results over ${__DIR__}/TEMP_runtest_printout ======"