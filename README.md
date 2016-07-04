# serverless-survey-forms (still under construction)

[![Serverless Framework](https://camo.githubusercontent.com/547c6da94c16fedb1aa60c9efda858282e22834f/687474703a2f2f7075626c69632e7365727665726c6573732e636f6d2f6261646765732f76332e737667)](http://www.serverless.com/)
[![Build Status](https://travis-ci.org/phejimlin/serverless-survey-forms.svg?branch=master)](https://travis-ci.org/phejimlin/serverless-survey-forms)
[![Coverage Status](https://coveralls.io/repos/github/phejimlin/serverless-survey-forms/badge.svg?branch=master)](https://coveralls.io/github/phejimlin/serverless-survey-forms?branch=master)

To create a google-style survey forms, authorized users could design surveys and collect anonymous feedbacks.

## Architecture Overview

![](http://i.imgur.com/gBDCCON.png)

## Environment

This project depends on the following modules, please make sure they're ready locally.

* NodeJS 3.7.3
* serverless 0.5.5
* aws-sdk 2.3.7
* node-uuid 1.4.7
* chai 3.5.0
* dynalite 1.0.0
* mocha 2.4.5

The Vagrant file could save your time to prepare environemnt if you would like to leverage. 

## Install

The steps below can be taken to install the project and initialize it.

Open a command line terminal and cd to the location where you will be placing the serverless-survey-forms project.

Clone the project directly from Github:

```git clone https://github.com/trendmicro/serverless-survey-forms.git```

Enter the serverless-survey-form folder that was just created:

```cd serverless-survey-form```

Initialize the project:

```serverless project init```

Install npm dependency modules in serverless-survey-form and serverless-survey-form/api

```
npm install
cd api
npm install
```

Deploy your functions and endpoints:

```serverless dash deploy```

## Unit Test

The steps below can be taken to verify the functionality.

Enter the serverless-survey-form folder the project was cloned:

```cd serverless-survey-form```

Install npm dependency modules in serverless-survey-form

```npm install```

Verify the functionality before any code commit to Git.

```npm test```

## License

Licensed under the [MIT License](https://github.com/trendmicro/serverless-survey-forms/blob/master/LICENSE).
