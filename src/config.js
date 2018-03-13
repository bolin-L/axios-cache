export default {
    // 需要开启mock时的server url
    mockBaseURL: '',
    /**
     * 请求发送之前对数据、配置进行处理
     *
     * @param    {Object}           conf                     请求配置、数据
     * @return   {void}
     */
    filter: function (conf) {

    },
    /**
     * 服务器返回的原始数据，对该数据进行整理，符合axios-cache数据格式
     *
     * @param    {Object}           result                   服务起返回原始数据
     * @param    {Object}           conf                     请求配置、数据
     * @return   {void}
     */
    post: function (result, conf) {

    },
    /**
     * 格式化返回数据，符合view层展示需求
     *
     * @param    {Object}           result                   服务起返回原始数据
     * @param    {Object}           conf                     请求配置、数据
     * @return   {void}
     */
    format: function (result, conf) {

    }
}
