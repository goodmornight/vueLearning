// import base from './base'; // 导入接口域名列表
import request from '@utils/request'; // 导入http中创建的axios实例
import axios from 'axios';

const test = {    
    // 获取ip    
    getIp () {     
        return request.get(`ip`);
    },    
    // 测试    
    getTest () {        
        return request.get(`api/test`);    
    }
}

export default test
