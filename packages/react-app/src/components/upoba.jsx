import { INFURA_ID, NETWORK, NETWORKS } from "../constants";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Button } from "antd";
import React, { useState } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import ReactJson from "react-json-view";
import ReactDOM from "react-dom";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { Alert,  Card, Col, Input, List, Menu, Row, Upload, message, Spin, Typography } from "antd";
import { Transactor } from "../helpers";
import {
    useBalance,
    useContractLoader,
    useContractReader,
    useEventListener,
    useExternalContractLoader,
    useGasPrice,
    useOnBlock,
    useUserProvider,
} from "../hooks";



const { TextArea } = Input;
const { Paragraph } = Typography;
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
const tx = Transactor(userProvider, gasPrice);
const axios = require('axios');
const gasPrice = useGasPrice(targetNetwork, "fast");
const userProvider = useUserProvider(injectedProvider, localProvider);
const localProviderUrl = targetNetwork.rpcUrl;
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new StaticJsonRpcProvider(localProviderUrlFromEnv);
const blockExplorer = targetNetwork.blockExplorer;
const readContracts = useContractLoader(localProvider);
const writeContracts = useContractLoader(userProvider);
const targetNetwork = NETWORKS.rinkeby;
const DEBUG = false;




export default function upoba(props){
 
  /////////uPOBA/
const [injectedProvider, setInjectedProvider] = useState();

const [uPOBAipfs, setPOBAipfs] = useState();
const [sendThis, setSendingThis] = useState();
    const [imgupload, setImgUpload] = useState();
    const [IMGipfs, setIMGipfs] = useState();
    const [yourJSON, setYourJSON] = useState(STARTING_JSON);
    const [ipfsHash, setIpfsHash] = useState();
    const [ipfsDownHash, setIpfsDownHash] = useState();
    const [downloading, setDownloading] = useState();
    const [ipfsContent, setIpfsContent] = useState();
    const [route, setRoute] = useState();
    useEffect(() => {
        setRoute(window.location.pathname);
    }, [setRoute]);

const STARTING_JSON = {
    description: "It's actually a bison?",
    external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
    image: "https://austingriffith.com/images/paintings/buffalo.jpg",
    name: "Buffalo",
    attributes: [{
            trait_type: "BackgroundColor",
            value: "green",
        },
        {
            trait_type: "Eyes",
            value: "googly",
        },
    ],
};
//////////////////////////upoba
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const uPOBAupload = ( <
        Upload name = "image"
        listType = "picture-card"
        className = "avatar-uploader"
        showUploadList = { false }
        customRequest = {
            async a => {
                console.log("CUSTOM REQUIEST", a);
                setImgUpload(true);
                const result = await ipfs.add(a.file);
                console.log("UPLOADED", result);
                setIMGipfs(result.path);
                setImgUpload(false);
            }
        }
        onChange = {
            a => {
                console.log("CHANGE", a);
            }
        } > { " " } {
            IMGipfs ? < img src = { "https://ipfs.io/ipfs/" + IMGipfs }
            style = {
                { maxWidth: 90, maxHeight: 90 }
            }
            /> : "image"}{" "} < /
            Upload >
        );

        const POBAimageUpload = imgupload ? < Spin style = {
            { margin: 32 }
        }
        /> : uPOBAupload;

        const [pobaName, setPOBAname] = useState();
        const [pobaDesc, setPOBAdesc] = useState();
        const [extURL, setEXTurl] = useState();
        const [animationUrl, setAnimationUrl] = useState();
        const [youtubeUrl, setYoutubeUrl] = useState();

        const displayPOBAform = ( <
            div style = {
                { maxWidth: 320, margin: "auto", marginTop: 32, paddingBottom: 32 }
            } >
            <
            Input Placeholder = "name"
            onChange = {
                e => {
                    setPOBAname(e.target.value);
                }
            }
            value = { pobaName }
            style = {
                { marginTop: 16 }
            }
            /> <
            TextArea Placeholder = "description"
            rows = { 4 }
            style = {
                { marginTop: 16 }
            }
            onChange = {
                e => {
                    setPOBAdesc(e.target.value);
                }
            }
            value = { pobaDesc }
            /> <
            Input Placeholder = "external url"
            onChange = {
                e => {
                    setEXTurl(e.target.value);
                }
            }
            value = { extURL }
            style = {
                { marginTop: 16 }
            }
            /> <
            Input Placeholder = "animation url"
            onChange = {
                e => {
                    setAnimationUrl(e.target.value);
                }
            }
            value = { animationUrl }
            style = {
                { marginTop: 16 }
            }
            /> <
            Input Placeholder = "youtube url"
            onChange = {
                e => {
                    setYoutubeUrl(e.target.value);
                }
            }
            value = { youtubeUrl }
            style = {
                { marginTop: 16 }
            }
            />{" "} < /
            div >
        );

        const [uPOBAnft, setUpobaNote] = useState();

        const uPOBAform = ( <
            div style = {
                { maxWidth: 520, margin: "auto", paddingBottom: 32 }
            } >
            <
            TextArea Placeholder = "uPOBAnft"
            rows = { 16 }
            style = {
                { marginTop: 16 }
            }
            onChange = {
                e => {
                    setUpobaNote(e.target.value);
                }
            }
            value = { uPOBAnft }
            />{" "} < /
            div >
        );


        const uploadButton = ( <
            div style = {
                { padding: 16 }
            } >
            <
            Button style = {
                { margin: 8 }
            }
            loading = { sendThis }
            size = "large"
            shape = "round"
            type = "primary"
            disabled = {!uPOBAnft || !pobaName || !pobaDesc || !IMGipfs }
            onClick = {
                async() => {
                    console.log(uPOBAnft, pobaName, pobaDesc, IMGipfs);
                    console.log("UPLOADING...", yourJSON);

                    let manifest = {
                        name: pobaName,
                        description: pobaDesc,
                        image: "https://ipfs.io/ipfs/" + IMGipfs,
                        uPOBAnft: uPOBAnft,
                    };
                    if (extURL) {
                        manifest.external_url = extURL;
                    }
                    if (animationUrl) {
                        manifest.animation_url = animationUrl;
                    }
                    if (youtubeUrl) {
                        manifest.youtube_url = youtubeUrl;
                    }

                    //console.log("manifest",manifest)

                    setSendingThis(true);
                    setIpfsHash();
                    const result = await ipfs.add(JSON.stringify(manifest)); // addToIPFS(JSON.stringify(yourJSON))
                    setPOBAipfs(result.path);
                    setSendingThis(false);
                    console.log("RESULT:", result);
                }
            } >
            Upload Manifest { " " } <
            /Button>{" "} < /
            div >
        );

        const [uPOBAminting, setUpobaMinting] = useState();
        const [pobaResult, setUpobaResult] = useState("");

        const upobaButton = ( <
            Button style = {
                { margin: 8 }
            }
            loading = { uPOBAminting }
            size = "large"
            shape = "round"
            type = "primary"
            disabled = {!uPOBAnft || !uPOBAipfs }
            onClick = {
                async() => {
                    console.log("MINTING...", uPOBAipfs, uPOBAnft);

                    setUpobaMinting(true);

                    const uPOBAresult = await tx(writeContracts.POBAlinkmerch.mintItem(uPOBAipfs, uPOBAnft));

                    setUpobaMinting(false);

                    console.log("uPOBAresult", uPOBAresult);
                    setUpobaResult( <
                        div style = {
                            { marginTop: 32, paddingBottom: 256 }
                        } >
                        <
                        Link onClick = {
                            () => {
                                setRoute("/yourcollectibles");
                            }
                        }
                        to = "/yourcollectibles" > { " " }🎉🍾🎊
                        Success!!!🏷Click here to view the { pobaName }
                        POBA NFT!
                        <
                        /Link>{" "} < /
                        div > ,
                    );
                }
            } >
            Mint NFT { " " } <
            /Button>
        );
        ////////////////////////////////////////////////////////////////


  return (
    <div>
      <
            div style = {
                { width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }
            } > { displayPOBAform } { POBAimageUpload }  {
                IMGipfs ? ( <
                    div style = {
                        { padding: 16 }
                    } > <
                    Paragraph copyable > { IMGipfs } < /Paragraph> < /
                    div >
                ) : ( <
                    div style = {
                        { padding: 16 }
                    } > < /div>
                )
            } { uPOBAform } { uploadButton } {
                uPOBAipfs ? ( <
                    div style = {
                        { padding: 16 }
                    } > <
                    Paragraph copyable > { uPOBAipfs } < /Paragraph>< /
                    div >
                ) : ( <
                    div style = {
                        { padding: 16 }
                    } > < /div>
                )
            } { upobaButton } { pobaResult } <
            /div>
    </div>
  );
}
