export const setStorage = (key:string, data:any) => {
    if(typeof data === 'object'){
      data = JSON.stringify(data);
    }
    return localStorage.setItem(key, data);
  }
  
  export const getStorage = (key:string) => {
    let data = localStorage.getItem(key);
    try {
      //data = JSON.parse(data);
      console.log(data,'------------')
    } catch (err) {
      // data = data;
    }
    return data;
  }
  
  export const removeStorage = (key:string) => {
    return localStorage.removeItem(key);
  }
  
  export const clearStorage = () => {
    return localStorage.clear();
  }
  
  