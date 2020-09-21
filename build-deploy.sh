#!/bin/sh

echo "Make sure running this scripts INSIDE dev docker"
echo "build facade to tearust/builds folder"
rm -rf /tearust/builds/tea-layer1-facade
mkdir -p /tearust/builds/tea-layer1-facade

cp -r /tearust/tea-layer1-facade/src /tearust/builds/tea-layer1-facade/
cp /tearust/tea-layer1-facade/package.json /tearust/builds/tea-layer1-facade/

cd /tearust/builds/tea-layer1-facade/
npm i

echo "copying tea-layer1-facade for alice.."
rm -rf /tearust/nodes/alice/tea-layer1-facade
cp -r /tearust/build/tea-layer1-facade /tearust/nodes/alice
echo "copying tea-layer1-facade for bob.."
rm -rf /tearust/nodes/bob/tea-layer1-facade
cp -r /tearust/build/tea-layer1-facade /tearust/nodes/bob
echo "copying tea-layer1-facade for charlie.."
rm -rf /tearust/nodes/charlie/tea-layer1-facade
cp -r /tearust/build/tea-layer1-facade /tearust/nodes/charlie
echo "copying tea-layer1-facade for dave.."
rm -rf /tearust/nodes/dave/tea-layer1-facade
cp -r /tearust/build/tea-layer1-facade /tearust/nodes/dave
echo "done deploying tea-layer1-facade"