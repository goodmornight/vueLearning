import request from '@utils/request'; // 引入封装好的Axios

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
