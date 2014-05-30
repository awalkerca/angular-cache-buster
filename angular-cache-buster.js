angular.module('ngCacheBuster', [])
    .config(function ($httpProvider) {
        "use strict";
        return $httpProvider.interceptors.push('httpRequestInterceptorCacheBuster');
    }).provider('httpRequestInterceptorCacheBuster', function () {
        "use strict";

        this.matchlist = [/.*partials.*/, /.*views.*/ ];
        this.logRequests = false;

        //Default to whitelist (i.e. block all except matches)
        this.black = false;

        //Select blacklist or whitelist, default to whitelist
        this.setMatchlist = function (list, black) {
            this.black = (typeof black != 'undefined') ? black : false;
            this.matchlist = list;
        };

        this.paramname = "cacheBuster";
        this.paramvalue = null;

        this.setLogRequests = function (logRequests) {
            this.logRequests = logRequests;
        };

        this.setParamName = function (newName) {
            this.paramname = newName;
        };

        this.setParamValue = function (newValue) {
            this.paramvalue = newValue;
        };

        this.$get = function ($q, $log) {
            var matchlist = this.matchlist,
                logRequests = this.logRequests,
                black = this.black,
                paramname = this.paramname,
                paramvalue = this.paramvalue;

            $log.log("Blacklist? ", black);
            return {
                'request': function (config) {
                    //Blacklist by default, match with whitelist
                    var busted = !black,
                        i = 0,
                        d,
                        log = "",
                        logger;

                    for (i; i < matchlist.length; i = i + 1) {
                        if (config.url.match(matchlist[i])) {
                            busted = black;
                            break;
                        }
                    }

                    //Bust if the URL was on blacklist or not on whitelist
                    if (busted) {
                        d = new Date();
                        paramvalue = paramvalue || d.getTime();
                        //Some urls already have '?' attached
                        config.url += config.url.indexOf('?') === -1 ? '?' : '&'
                        config.url += paramname + '=' + paramvalue;
                    }

                    if (logRequests) {
                        log = 'request.url =' + config.url;
                        logger = busted ? $log.warn : $log.info;
                        logger(log);
                    }

                    return config || $q.when(config);
                }
            };
        };
    });


