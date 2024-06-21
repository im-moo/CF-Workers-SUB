let mytoken = 'auto';
let BotToken = '';
let ChatID = '';
let TG = 0;
let FileName = 'CF-Workers-SUB';
let SUBUpdateTime = 6;
let total = 99;
let timestamp = 4102329600000;
let MainData = `
vless://b7a392e2-4ef0-4496-90bc-1c37bb234904@cf.090227.xyz:443?encryption=none&security=tls&sni=edgetunnel-2z2.pages.dev&fp=random&type=ws&host=edgetunnel-2z2.pages.dev&path=%2F%3Fed%3D2048#%E5%8A%A0%E5%85%A5%E6%88%91%E7%9A%84%E9%A2%91%E9%81%93t.me%2FCMLiussss%E8%A7%A3%E9%94%81%E6%9B%B4%E5%A4%9A%E4%BC%98%E9%80%89%E8%8A%82%E7%82%B9
https://sub.xf.free.hr/auto
https://WARP.fxxk.dedyn.io/auto
`;
let urls = [];
let subconverter = "apiurl.v1.mk";
let subconfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini";

export default {
    async fetch(request, env) {
        const userAgentHeader = request.headers.get('User-Agent');
        const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
        const url = new URL(request.url);
        const token = url.searchParams.get('token');
        mytoken = env.TOKEN || mytoken;
        BotToken = env.TGTOKEN || BotToken;
        ChatID = env.TGID || ChatID;
        TG = env.TG || TG;
        subconverter = env.SUBAPI || subconverter;
        subconfig = env.SUBCONFIG || subconfig;
        FileName = env.SUBNAME || FileName;
        MainData = env.LINK || MainData;
        if (env.LINKSUB) urls = await ADD(env.LINKSUB);

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const timeTemp = Math.ceil(currentDate.getTime() / 1000);
        const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);

        let UD = Math.floor(((timestamp - Date.now()) / timestamp * 99 * 1099511627776 * 1024) / 2);
        total = total * 1099511627776 * 1024;
        let expire = Math.floor(timestamp / 1000);
        SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

        let combinedLinks = await ADD(MainData + '\n' + urls.join('\n'));
        let selfBuiltNodes = "";
        let subscriptionLinks = "";
        for (let x of combinedLinks) {
            if (x.toLowerCase().startsWith('http')) {
                subscriptionLinks += x + '\n';
            } else {
                selfBuiltNodes += x + '\n';
            }
        }
        MainData = selfBuiltNodes;
        urls = await ADD(subscriptionLinks);

        if (!(token == mytoken || token == fakeToken || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
            if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") {
                await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}\n域名: ${url.hostname}\n入口: ${url.pathname + url.search}`);
            }
            const envKey = env.URL302 ? 'URL302' : (env.URL ? 'URL' : null);
            if (envKey) {
                const URLs = await ADD(env[envKey]);
                const URL = URLs[Math.floor(Math.random() * URLs.length)];
                return envKey === 'URL302' ? Response.redirect(URL, 302) : fetch(new Request(URL, request));
            }
            return new Response(await nginx(), {
                status: 200,
                headers: {
                    'Content-Type': 'text/html; charset=UTF-8',
                },
            });
        } else {
            await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}\n域名: ${url.hostname}\n入口: ${url.pathname + url.search}`);
            let subscriptionFormat = 'base64';
            if (userAgent.includes('null') || userAgent.includes('subconverter') || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase())) {
                subscriptionFormat = 'base64';
            } else if (userAgent.includes('clash') || (url.searchParams.has('clash') && !userAgent.includes('subconverter'))) {
                subscriptionFormat = 'clash';
            } else if (userAgent.includes('sing-box') || userAgent.includes('singbox') || ((url.searchParams.has('sb') || url.searchParams.has('singbox')) && !userAgent.includes('subconverter'))) {
                subscriptionFormat = 'singbox';
            }

            let subconverterUrl;
            let subscriptionConversionURL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
            let req_data = MainData;
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
            }, 2000);

            let additionalUA = 'v2rayn';
            if (url.searchParams.has('clash')) {
                additionalUA = 'clash';
            } else if (url.searchParams.has('singbox')) {
                additionalUA = 'singbox';
            }

            try {
                const responses = await Promise.allSettled(urls.map(url =>
                    fetch(url, {
                        method: 'get',
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;',
                            'User-Agent': `${additionalUA} cmliu/CF-Workers-SUB ${userAgentHeader}`
                        },
                        signal: controller.signal
                    }).then(response => {
                        if (response.ok) {
                            return response.text().then(content => {
                                if (content.includes('dns') && content.includes('proxies') && content.includes('proxy-groups')) {
                                    subscriptionConversionURL += "|" + url;
                                } else if (content.includes('dns') && content.includes('outbounds') && content.includes('inbounds')) {
                                    subscriptionConversionURL += "|" + url;
                                } else {
                                    return content;
                                }
                            });
                        } else {
                            return "";
                        }
                    })
                ));

                for (const response of responses) {
                    if (response.status === 'fulfilled' && response.value) {
                        const content = response.value;
                        req_data += base64Decode(content) + '\n';
                    }
                }

            } catch (error) {
                // Handle error
            } finally {
                clearTimeout(timeout);
            }

            const utf8Encoder = new TextEncoder();
            const encodedData = utf8Encoder.encode(req_data);
            const text = String.fromCharCode.apply(null, encodedData);

            const uniqueLines = new Set(text.split('\n'));
            const result = [...uniqueLines].join('\n');
            const base64Data = btoa(result);

            if (subscriptionFormat == 'base64' || token == fakeToken) {
                return new Response(base64Data, {
                    headers: {
                        "content-type": "text/plain; charset=utf-8",
                        "Profile-Update-Interval": `${SUBUpdateTime}`,
                        "Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
                    }
                });
            } else if (subscriptionFormat == 'clash') {
                subconverterUrl = `https://${subconverter}/sub?target=clash&url=${encodeURIComponent(subscriptionConversionURL)}&insert=false&config=${encodeURIComponent(subconfig)}`;
            } else if (subscriptionFormat == 'singbox') {
                subconverterUrl = `https://${subconverter}/sub?target=singbox&url=${encodeURIComponent(subscriptionConversionURL)}&insert=false&config=${encodeURIComponent(subconfig)}`;
            }

            const response = await fetch(subconverterUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;',
                    'User-Agent': `${additionalUA} cmliu/CF-Workers-SUB ${userAgentHeader}`
                }
            });

            const content = await response.text();

            return new Response(content, {
                headers: {
                    "content-type": "text/plain; charset=utf-8",
                    "Profile-Update-Interval": `${SUBUpdateTime}`,
                    "Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
                }
            });
        }
    }
};

async function ADD(data) {
    return data.split('\n').map(line => line.trim()).filter(line => line !== "");
}

async function MD5MD5(data) {
    const encoder = new TextEncoder();
    const dataAsUint8Array = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('MD5', dataAsUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function sendMessage(subject, ip, message) {
    const body = {
        chat_id: ChatID,
        text: `${subject}\nIP: ${ip}\n${message}`
    };
    const url = `https://api.telegram.org/bot${BotToken}/sendMessage`;

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
}

function base64Decode(str) {
    return decodeURIComponent(atob(str).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
}

async function nginx() {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Welcome to nginx!</title>
            <style>
                body {
                    width: 35em;
                    margin: 0 auto;
                    font-family: Tahoma, Verdana, Arial, sans-serif;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to nginx!</h1>
            <p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>
            <p>For online documentation and support please refer to
            <a href="http://nginx.org/">nginx.org</a>.<br/>
            Commercial support is available at
            <a href="http://nginx.com/">nginx.com</a>.</p>
            <p><em>Thank you for using nginx.</em></p>
        </body>
        </html>
    `;
}
