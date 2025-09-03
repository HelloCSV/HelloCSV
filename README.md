<br/>
<div align="center">
<a href="https://github.com/HelloCSV/HelloCSV">
<img src="docs/images/logo.png" alt="Logo" width="80" height="80">
</a>
<h3 align="center">HelloCSV</h3>
<p align="center">
A modern, drop in, frontend only, CSV importer workflow.
<br/>
<br/>
<a href="https://hellocsv.mintlify.app/common/get-started/introduction"><strong>Explore the docs »</strong></a>
<br/>
<br/>
<a href="https://hellocsv.github.io/HelloCSV/">View Demo .</a>  
<a href="https://github.com/HelloCSV/HelloCSV/issues/new?labels=bug">Report Bug .</a>
<a href="https://github.com/HelloCSV/HelloCSV/issues/new?labels=enhancement">Request Feature</a>
</p>
</div>

[![NPM](https://img.shields.io/npm/v/hello-csv.svg)](https://www.npmjs.com/package/hello-csv)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://github.com/HelloCSV/HelloCSV/actions/workflows/run-tests.yml/badge.svg)](https://github.com/HelloCSV/HelloCSV/actions/workflows/run-tests.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## About The Project

![Screenshot](docs/images/demo.gif)

A challenge almost every project eventually faces is importing user uploaded data from CSV files in a way that doesn't cause a ton of issues. Developers always have to figure out

- How do you make sure that data uploaded is correct
- How do you notify the user that the data is incorrect before they upload it, and give the user a chance to fix it
- Incorrect or duplicate data that is uploaded is super annoying to try to fix after-the-fact
- Run automatic formatters (ex: phone number formatting), but providing a way for the user to see what our formatter did before uploading as a sanity check

HelloCSV a Javascript library that drops in a CSV importer into your project that:

- Supports custom columns
- with custom validations
- and custom transformations
- a nice UI that walks a user through a 4 step process of uploading a CSV (upload, map columns, preview data, upload confirmation)
- with a small JS footprint
- that doesn't assume your frontend stack

## Install

With npm:

```sh
npm install hello-csv
```

From CDN

```
<script src="https://cdn.jsdelivr.net/npm/hello-csv@0.3.6/dist/bundled/index.es.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/hello-csv@0.3.6/dist/bundled/hello-csv.css">
```

## Documentation

Current documentation could be find [here](https://hellocsv.mintlify.app/)
