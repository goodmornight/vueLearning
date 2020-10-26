import request from '@utils/request';

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
