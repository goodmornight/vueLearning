// import base from './base'; // 导入接口域名列表
import request from '@utils/request'; // 导入http中创建的axios实例
import axios from 'axios';

const test = {    
    // 获取ip    
    getIp () {        
        return axios.get('https://api.ipify.org/ip');    
    },    
    // 测试    
    getTest () {        
        return request.get(`api/test`);    
    },
    getTest2 () {        
        return axios.get(`http://127.0.0.1:8080/api/test`);    
    }
}

export default test
