#!/bin/bash

shimjs_existed_before=$([ -f shim.js ] && echo "true" || echo "false")

./node_modules/.bin/rn-nodeify --yarn --install assert,events,stream,string_decoder,url --hack

if [[ $shimjs_existed_before == "false" ]]; then
    # shimjs did not exist before but was created by nodeify
    rm ./shim.js
fi
