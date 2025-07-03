import crypto from "crypto"

class jwt {
    sign(data, secret, options){     
      if(options?.expiresIn)
        data.exp = Date.now() + options.expiresIn;
      data.iat = Math.floor(Date.now()/1000);
      const stringifiedData = JSON.stringify(data);
      const hash = crypto.createHash('sha256').update(stringifiedData).update(secret).digest('hex');
      const bufferData = Buffer.from(stringifiedData).toString('base64url')
      return `${bufferData}.${hash}`;
    }

    verify(token, secret) {
        const [encoded, hash ] = token.split('.');
        if(!encoded || !hash) 
            throw new Error({name: 'InvalidToken'});
        const stringifiedData = Buffer.from(encoded, 'base64url').toString();
        const newHash = crypto.createHash('sha256').update(stringifiedData).update(secret).digest('hex');
        if(hash === newHash)            
            return JSON.parse(stringifiedData);
        else 
            throw new Error({name: 'InvalidToken'})
    }
}
export default new jwt();