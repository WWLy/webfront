/**
 * Created by Joe on 16/04/2017.
 */
'use strict';
angular.module('webFront')
// .constant('baseUrl', 'http://wc.smart360.cc/')
    .constant('env', {
      baseUrl: 'http://wc.jinli.com.cn/'
    })
    .constant('msg', {
      AVATAR: 'http://image.smart360.cn/59032d4b4d660068f8aec400.jpg',
      A_MINUTE: 60000,
      COOKIE_TOKEN_KEY: 'XSRF-TOKEN',
      EMPTY_DATA: '暂无数据',
      EMPTY_IMG:'请选择需要上传的图片',
      HEADER_TOKEN_KEY: 'X-XSRF-TOKEN',
      LIMIT:20,
      LOADING_DURATION: 2000,
      LOADING_ERROR: '数据加载失败',
      LOCAL_TOKEN_KEY: 'TOKEN',
      LOCAL_USER_KEY: 'USER',
      LOGIN_FAILURE: '用户名密码错误',
      UPD_ERROR:'更新失败',
      UPD_SUCCESS:'更新成功',
      UPLOADING:'上传中',
      UPLOAD_IMG_ERROR: '图片上传失败',
      UPLOAD_TYPE_ERROR: '文件格式错误',
      USER_ACCOUNT_EMPTY: '请输入用户名',
      USER_INVALID: '登录认证已失效',
      USER_INVALID_KEY_1: 401,
      USER_INVALID_KEY_2: 402,
      USER_INVALID_KEY_3: 403,
      USER_PASSWORD_EMPTY: '请输入密码',
      OPERATION_SUCCESS:'操作成功',
      OPERATION_ERROR:'操作失败',
      OPERAROE_EMPTY:'请选择维修人员'
    });
