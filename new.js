const mytoken = 'auto'; // 可以随便取，或者uuid生成，https://1024tools.com/uuid
const FileName = 'CF-Workers-SUB';
const SUBUpdateTime = 6; // 自定义订阅更新时间，单位小时
const total = 99 * 1099511627776 * 1024; // 99PB
const timestamp = 4102329600000; // 2099-12-31

// 节点链接 + 订阅链接
let MainData = `
vless://b7a392e2-4ef0-4496-90bc-1c37bb234904@cf.090227.xyz:443?encryption=none&security=tls&sni=edgetunnel-2z2.pages.dev&fp=random&type=ws&host=edgetunnel-2z2.pages.dev&path=%2F%3Fed%3D2048#%E5%8A%A0%E5%85%A5%E6%88%91%E7%9A%84%E9%A2%91%E9%81%93t.me%2FCMLiussss%E8%A7%A3%E9%94%81%E6%9B%B4%E5%A4%9A%E4%BC%98%E9%80%89%E8%8A%82%E7%82%B9
https://sub.xf.free.hr/auto
https://WARP.fxxk.dedyn.io/auto
`;

let urls = [];
const subconverter = "apiurl.v1.mk"; // 在线订阅转换后端
const subconfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; // 订阅配置文件

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const token = url.searchParams.get('token');
        const fakeToken = await MD5MD5(`${mytoken}${Math.ceil(Date.now() / 1000 / 86400)}`);

        if (token !== mytoken && token !== fakeToken) {
            return new Response(await nginx(), {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            });
        }

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const timeTemp = Math.ceil(currentDate.getTime() / 1000);
        const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);

        let UD = Math.floor(((timestamp - Date.now()) / timestamp * 99 * 1099511627776 * 1024) / 2);
        let expire = Math.floor(timestamp / 1000);

        let mergedLinks = await mergeLinks(MainData, urls.join('\n'));
        let customNodes = "", subscriptionLinks = "";

        for (let link of mergedLinks) {
            if (link.startsWith('http')) {
                subscriptionLinks += link + '\n';
            } else {
                customNodes += link + '\n';
            }
        }

        MainData = customNodes;
        urls = await splitLinks(subscriptionLinks);

        let subscriptionFormat = 'base64';
        const userAgentHeader = request.headers.get('User-Agent');
        const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";

        if (userAgent.includes('clash')) {
            subscriptionFormat = 'clash';
        } else if (userAgent.includes('singbox')) {
            subscriptionFormat = 'singbox';
        }

        let subscriptionConversionURL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
        let additionalData = MainData;

        try {
            const responses = await fetchAllUrls(urls, userAgentHeader);

            for (const response of responses) {
                if (response.status === 'fulfilled' && response.value) {
                    const content = response.value;
                    additionalData += base64Decode(content) + '\n';
                }
            }
        } catch (error) {
            console.error(error);
        }

        const uniqueData = removeDuplicates(additionalData);
        const base64Data = btoa(uniqueData);

        if (subscriptionFormat === 'base64' || token === fakeToken) {
            return new Response(base64Data, {
                headers: {
                    "content-type": "text/plain; charset=utf-8",
                    "Profile-Update-Interval": `${SUBUpdateTime}`,
                    "Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
                }
            });
        } else {
            return await fetchConvertedData(subscriptionFormat, subscriptionConversionURL, subconfig, userAgentHeader, additionalData);
        }
    }
};

async function mergeLinks(...data) {
    return data.join('\n').split('\n').map(line => line.trim()).filter(line => line !== "");
}

async function splitLinks(data) {
    return data.split('\n').map(line => line.trim()).filter(line => line !== "");
}

async function fetchAllUrls(urls, userAgentHeader) {
    const fetchPromises = urls.map(url =>
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;',
                'User-Agent': `${userAgentHeader}`
            }
        }).then(response => response.ok ? response.text() : "")
    );

    return Promise.allSettled(fetchPromises);
}

async function fetchConvertedData(format, url, config, userAgentHeader, additionalData) {
    const target = format === 'clash' ? 'clash' : 'singbox';
    const subconverterUrl = `https://${subconverter}/sub?target=${target}&url=${encodeURIComponent(url)}&insert=false&config=${encodeURIComponent(config)}`;

    try {
        const response = await fetch(subconverterUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;',
                'User-Agent': `${userAgentHeader}`
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
    } catch (error) {
        console.error(error);
        return new Response(btoa(additionalData), {
            headers: {
                "content-type": "text/plain; charset=utf-8",
                "Profile-Update-Interval": `${SUBUpdateTime}`,
                "Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
            }
        });
    }
}

function removeDuplicates(data) {
    const utf8Encoder = new TextEncoder();
    const encodedData = utf8Encoder.encode(data);
    const text = String.fromCharCode.apply(null, encodedData);
    const uniqueLines = new Set(text.split('\n'));
    return [...uniqueLines].join('\n');
}

function base64Decode(str) {
    const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
}

async function MD5MD5(text) {
    const encoder = new TextEncoder();
    const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
    const firstPassArray = Array.from(new Uint8Array(firstPass));
    const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
    const secondPassArray = Array.from(new Uint8Array(secondPass));
    const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return secondHex.toLowerCase();
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
            <p>For online documentation and support please refer to <a href="http://nginx.org/">nginx.org</a>.</p>
            <p>Commercial support is available at <a href="http://nginx.com/">nginx.com</a>.</p>
            <p><em>Thank you for using nginx.</em></p>
        </body>
        </html>
    `;
}
