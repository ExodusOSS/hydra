#!/usr/bin/env bash
# https://stackoverflow.com/questions/75897834/use-of-bitwise-with-boolean-operands

sed -i -e 's/node->getLayout().hadOverflow() |$/node->getLayout().hadOverflow() ||/' node_modules/react-native/ReactCommon/yoga/yoga/Yoga.cpp
