Github Download
=========

Downloads a github repository, and then extracts it.

### Usage


`npm install github-download --save`

First you need to set the user agent.  Github requires your requests to their api to have a user agent.  Read more [here](https://developer.github.com/v3/#user-agent-required);

```
githubDownload.setUserAgent('userAgent');
```

Download Repository
```
githubDownload(options, callback);
```

### Options

`username` String.  Username of owner of repository

`repo` String.  Name of repository to download.

`output` String.  Path to extract the repository to.  We do not create a containing folder.

`version` String. Currently only "latest" is supported. Downloads latest release.