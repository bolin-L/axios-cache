import axios from 'axios'
import config from './config'
import setting from './setting'
import _ from 'lodash'

const CACHE_KEY = 'axios-cache'
export default class AxiosCache {
    constructor() {
        // 请求配置
        this.__config = {}
        this.__httpStatus = setting.httpStatus
        this.__clientCode = setting.clientCode
        this.init()
    }

    init() {
        this.doFlushSetting(this.globalCacheKey || CACHE_KEY, config)
        this.globalConfig = this.__config[this.globalCacheKey || CACHE_KEY] || {}
    }

    /**
     * 设置服务器端返回的状态码与前端使用的状态码的匹配关系
     *
     * @param    {Object}       http        服务器端返回的状态码
     * @param    {Object}       client      客户端使用的状态码
     * @return   {void}
     */
    doMapStatusCode(http, client) {
        this.__httpStatus = Object.assign(this.__httpStatus, http)
        this.__clientCode = Object.assign(this.__clientCode, client)
    }

    /**
     * 根据后端返回的http状态码获取客户端设置对应的状态码的KEY
     *
     * @param    {Integer}       status        服务器端返回的状态码
     * @return   {void}
     */
    getMapStatusCodeKey(status) {
        for (let code in this.__httpStatus) {
            if (this.__httpStatus.hasOwnProperty(code)) {
                if (this.__httpStatus[code].indexOf(status) !== -1) {
                    return code
                }
            }
        }
    }

    /**
     * 设置请求配置
     *
     * @param       {String}   key          整个cache的唯一性key
     * @param       {Object}   conf         该cache的全部请求配置
     * @return      {void}
     */
    doFlushSetting(key, conf) {
        if (!key && typeof key !== 'string') {
            return
        }
        conf = Object.assign(this.__config[key] || {}, conf);
        this.__config[key] = conf
    }

    /**
     * 处理后端返回错误状态码，子类重写
     * @override
     *
     * @param       {Integer}   code        客户端状态码
     * @param       {Object}    result      客户端返回的数据
     * @return      {void}
     */
    handleErrorCase(code, result) {
    }

    /**
     * 发送请求
     *
     * @param       {String}   key        配置请求的key
     * @param       {Object}   options      请求发送的数据
     * @return      {void}
     */
    sendRequest(key, options) {
        let conf = _.cloneDeep((this.__config[this.settingKey] || {})[key])
        if (!conf) {
            throw new Error(`can not find config key ${this.settingKey}`)
        }
        let reg0 = /\{(.*?)\}/gi
        /* eslint-disable */
        let reg1 = /:([^-\/|\.]*)/gi
        if (!key && typeof key !== 'string' || !conf) {
            return
        }
        conf = Object.assign(conf, options)
        let params = conf.params || {}
        let data = conf.data || {}
        // rest接口参数替换
        if (conf.rest) {
            conf.url = conf.url.replace(reg0, function ($0, $1) {
                return params[$1] ? params[$1] : (data[$1] ? data[$1] : $0)
            }).replace(reg1, function ($0, $1) {
                return params[$1] ? params[$1] : (data[$1] ? data[$1] : $0)
            });
        }
        // 非异步接口
        if (conf.ajax === false) {
            window.open(conf.url, conf.target ? conf.target : '_blank')
            return
        }
        // local get mock
        // mock example
        // {
        //     code: 2xx|3xx|4xx||5xx,
        //     message: '',
        //     result: array|object|...
        // }
        if (conf.url.indexOf('localhost') !== -1 && conf.mock) {
            this.cbRequest(conf.mock, conf)
            return
        }
        if (this.globalConfig.mockBaseURL) {
            conf.baseURL = this.globalConfig.mockBaseURL
            conf.headers = Object.assign(conf.headers || {}, {
                'withCredentials': true
            })
        }
        // filter post data before send request
        this.globalConfig.filter && this.globalConfig.filter(conf);
        conf.filter && conf.filter(conf)
        // ajax
        return axios(conf)
            .then(function (response) {
                this.cbRequest(response.data, conf)
                return response.data;
            }.bind(this))
    }

    /**
     * ajax callback
     *
     * @param    {Object}           result                      ajax or mock response
     * @param    {Object}           conf                        api config
     * @return   {void}
     */
    cbRequest(result, conf) {
        // reorganize return data for axios-cache
        this.globalConfig.post && this.globalConfig.post(result, conf);
        conf.post && conf.post(result, conf)
        let codeKey = this.getMapStatusCodeKey(conf.resetReturnCode === undefined ? result.code : conf.resetReturnCode)
        if (this.__clientCode[codeKey] === this.__clientCode.CODE_OK) {
            // format data for view
            this.globalConfig.format && this.globalConfig.format(result, conf);
            conf.format && conf.format(result, conf)
            conf.onload && conf.onload(result)
        } else {
            conf.onerror && conf.onerror(result)
            this.handleErrorCase(this.__clientCode[codeKey], result)
        }
    }
}
