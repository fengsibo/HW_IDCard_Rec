Page({
  data: {
    tempFilePaths: '../../image/id_card_back.jpg',
    userInfo: '',
    nickname: '',
    avartarurl: '',

    name: '姓名',
    name_val: '',
    sex: '性别',
    sex_val: '',
    birth: '出生',
    nation: '民族',
    nation_val: '',
    birth_val: '',
    address: '住址',
    address_val: '',
    id: '身份证号码',
    id_val: '',

    topNum: 0,
    show_condition: true,
  },
  onLoad: function(e) {
    var _this = this;
    
    //加载摄像头
    _this.ctx = wx.createCameraContext();

    //获取用户信息
    wx.getUserInfo({
      success:function(res){
        _this.setData({
          nickname: res.userInfo.nickName,
          avartarurl:res.userInfo.avatarUrl,
        }),
        console.log(res.userInfo)
      },
      fail:function(res){
        console.log('get nickname fail');
        _this.setData({
          nickname: 'test'
        })
      }
    })
  },

  //调用微信摄像机
  call_camera: function(){
    var _this = this;
    _this.setData({
      topNum: 0,
      show_condition: false,
    });
  },

  //微信摄像机 拍照
  take_photo: function(){
    var _this = this;
    _this.ctx.takePhoto({
      quality: 'high',
      success:function(res){
        _this.setData({
          //返回的是单张
          tempFilePaths: res.tempImagePath,
          show_condition: true,
        });
        _this.show_msg('正在上传', 'loading');
        _this.up_load_photo(_this.data.tempFilePaths);
      },
    })
  },

  //调用摄像头之后 返回之前页
  back_index: function(){
    var _this = this;
    _this.setData({
      show_condition: true,
    });
  },

  //相册中选择图像向服务器发送数据 可选：拍照
  choose_photo: function() {
    var _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: function(res) {
        _this.setData({
          //返回的是文件列表 如果是一张的话 要取第一张
          tempFilePaths: res.tempFilePaths[0]
        });
        _this.show_msg('正在上传', 'loading');
        _this.up_load_photo();
      }
    });
  },

  //显示提示信息（自动消失）
  show_msg: function(show_str, show_icon='none'){
    wx.showToast({
      title: show_str,
      icon: show_icon,
      mask: true,
      duration: 1200
    })
  },
  show_model: function(show_str, status_code){
    wx.showModal({
      title: show_str,
      content: '请重新拍摄',
    })
  },


  //向服务器传送图像数据
  up_load_photo: function() {
    var _this = this;
    var app = getApp();
    var nickname = _this.data.nickname;
    if(nickname == null){
      nickname = 'test';
      console.log('cannot get nickname');
    }
    console.log(nickname, _this.data.tempFilePaths);
    wx.uploadFile({
      url: 'https://fengsibo.xyz/upload',
      //url: 'http://127.0.0.1:5000/upload',
      filePath: _this.data.tempFilePaths,
      name: 'file',
      method: 'POST',
      formData: {
        'nickname': nickname,
      },
      // 返回状态码
      // 0: 识别成功
      // 1: 文字定位失败
      // 2: 文字识别失败
      // 3: 图片读取失败
      // 4: 图像路径错误
      // 5: 程序异常
      // 6: 初始化失败
      success: function (res) {
        var data = res.data;
        var json = JSON.parse(data);
        //console.log(data.data);
        //从返回的值设置当前页面值
        var rec_status = json[0].status_code;
        console.log('recognize_status_code:', rec_status);
        _this.setData({
          name_val: json[0].name,
          sex_val: json[0].sex,
          nation_val: json[0].nation,
          birth_val: json[0].id.substring(6, 14),
          address_val: json[0].address,
          id_val: json[0].id,
        });

        switch(rec_status){
          case 0: _this.show_msg('识别成功', 'success'); break;
          case 1: _this.show_model('未定位到身份证'); break;
          case 2: _this.show_model('未识别身份证信息'); break;
          case 3: _this.show_model('图像读取错误'); break;
          default: _this.show_model('定位错误 FUNCTION ERROR'); break;
        };
      },
      fail: function (res) {
        _this.show_msg('识别失败');
      }
    });
  }
})