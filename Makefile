CI?=true


all: clean install run

install: clean
	CI=$(CI) yarn install && yarn test && yarn build

run:
	yarn start

clean:
	rm -rf build/*
	rm -rf target/*

.PHONY: all clean run install

