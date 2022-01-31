import { LinkOutlined } from "@ant-design/icons";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { formatEther, parseEther } from "@ethersproject/units";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Button, Card, Col, Input, List, Spin, Typography, Upload, Menu, Row } from "antd";
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import { utils } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import StackGrid from "react-stack-grid";
import Web3Modal from "web3modal";
import "./App.css";
//import assets from "./assets.js";
import { Account, Address, AddressInput, Contract, Faucet, GasGauge, Header, Ramp,  ThemeSwitch } from "./components";
import { DAI_ABI, DAI_ADDRESS, INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
  useExternalContractLoader,
  useGasPrice,
  useOnBlock,
  useUserProvider,
} from "./hooks";
import { BlockPicker } from 'react-color'

const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
//console.log("📦 Assets: ", assets);
const targetNetwork = NETWORKS.rinkeby; 
const DEBUG = true;

const STARTING_JSON = {
    description: "upoba custom nft",
    external_url: "https://fourswords.io", // <-- this can link to a page for the specific file too
    image: "https://storage.googleapis.com/fourswordsio-media/2020/09/2020/09/c152d28d-fourswords-logo.png",
    name: "FourSwords",
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

const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    console.log(content);
    return content;
  }
};

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
//
const scaffoldEthProvider = new StaticJsonRpcProvider("https://speedy-nodes-nyc.moralis.io/d0553b4370fc344989d16e94/eth/rinkeby/");
const mainnetInfura = new StaticJsonRpcProvider("https://speedy-nodes-nyc.moralis.io/d0553b4370fc344989d16e94/eth/rinkeby/");
const localProviderUrl = targetNetwork.rpcUrl;
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new StaticJsonRpcProvider(localProviderUrlFromEnv);
const blockExplorer = targetNetwork.blockExplorer;
const { TextArea } = Input;
const { Paragraph } = Typography;
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

function App(props) {
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;

  const logoutOfWeb3Modal = async () => {
     await web3Modal.clearCachedProvider();
     if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
       await injectedProvider.provider.disconnect();
     }
     setTimeout(() => {
       window.location.reload();
     }, 1);
  };

  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);

    const mainnetDAIContract = useExternalContractLoader(mainnetProvider, DAI_ADDRESS, DAI_ABI);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const isSigner = injectedProvider && injectedProvider.getSigner && injectedProvider.getSigner()._isSigner;


    // If you want to call a function on a new block
    useOnBlock(mainnetProvider, () => {
        console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
    });

    // Then read your DAI balance like:
    const myMainnetDAIBalance = useContractReader({ DAI: mainnetDAIContract }, "DAI", "balanceOf", [
        "0x95b58a6bff3d14b7db2f5cb5f0ad413dc2940658",
    ]);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  /*
  const myMainnetDAIBalance = useContractReader({ DAI: mainnetDAIContract }, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);*/

  // keep track of a variable from the contract in the local React state:
  const balance = useContractReader(readContracts, "DogeClubSVG", "balanceOf", [address]);
  console.log("🤗 balance:", balance);

  // 📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, "DogeClubSVG", "Transfer", localProvider, 1);
  console.log("📟 Transfer events:", transferEvents);

  //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //
  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [yourCollectibles, setYourCollectibles] = useState();

    useEffect(() => {
        const updateYourCollectibles = async() => {
            const collectibleUpdate = [];
            for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
                try {
                    console.log("GEtting token index", tokenIndex);
                    const tokenId = await readContracts.ABCNotationNFT.tokenOfOwnerByIndex(address, tokenIndex);
                    console.log("tokenId", tokenId);
                    const tokenURI = await readContracts.ABCNotationNFT.tokenURI(tokenId);
                    console.log("tokenURI", tokenURI);

                    const notation = await readContracts.ABCNotationNFT.notation(tokenId);
                    console.log("notation", notation);

                    const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
                    console.log("ipfsHash", ipfsHash);
                    const jsonManifestBuffer = await getFromIPFS(ipfsHash);

                    try {
                        const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
                        console.log("jsonManifest", jsonManifest);
                        collectibleUpdate.push({ id: tokenId, notation: notation, index: tokenIndex, uri: tokenURI, owner: address, ...jsonManifest });
                    } catch (e) {
                        console.log(e);
                    }

                } catch (e) {
                    console.log(e);
                }
            }
            setYourCollectibles(collectibleUpdate);
        };
        updateYourCollectibles();
    }, [address, yourBalance]);


    //
    // 🧫 DEBUG 👨🏻‍🔬
    //
    useEffect(() => {
        if (
            DEBUG &&
            mainnetProvider &&
            address &&
            selectedChainId &&
            yourLocalBalance &&
            yourMainnetBalance &&
            readContracts &&
            writeContracts &&
            mainnetDAIContract
        ) {
            console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
            console.log("🌎 mainnetProvider", mainnetProvider);
            console.log("🏠 localChainId", localChainId);
            console.log("👩‍💼 selected address:", address);
            console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
            console.log("💵 yourLocalBalance", yourLocalBalance ? formatEther(yourLocalBalance) : "...");
            console.log("💵 yourMainnetBalance", yourMainnetBalance ? formatEther(yourMainnetBalance) : "...");
            console.log("📝 readContracts", readContracts);
            console.log("🌍 DAI contract on mainnet:", mainnetDAIContract);
            console.log("🔐 writeContracts", writeContracts);
        }
    }, [
        mainnetProvider,
        address,
        selectedChainId,
        yourLocalBalance,
        yourMainnetBalance,
        readContracts,
        writeContracts,
        mainnetDAIContract,
    ]);

    let networkDisplay = "";
    const loadWeb3Modal = useCallback(async() => {
        const provider = await web3Modal.connect();
        setInjectedProvider(new Web3Provider(provider));
    }, [setInjectedProvider]);

    useEffect(() => {
        if (web3Modal.cachedProvider) {
            loadWeb3Modal();
        }
    }, [loadWeb3Modal]);

    const [route, setRoute] = useState();
    useEffect(() => {
        setRoute(window.location.pathname);
    }, [setRoute]);

    let faucetHint = "";
    const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name === "localhost";

    const [faucetClicked, setFaucetClicked] = useState(false);
    if (!faucetClicked &&
        localProvider &&
        localProvider._network &&
        localProvider._network.chainId === 31337 &&
        yourLocalBalance &&
        formatEther(yourLocalBalance) <= 0
    ) {
        faucetHint = ( <
            div style = {
                { padding: 16 }
            } >
            <
            Button type = "primary"
            onClick = {
                () => {
                    faucetTx({
                        to: address,
                        value: parseEther("0.01"),
                    });
                    setFaucetClicked(true);
                }
            } > 💰Grab funds from the faucet⛽️ <
            /Button> < /
            div >
        );
    }

    ////====================  ////====================  ////====================  ////====================  ////====================



 

 
  const [yourJSON, setYourJSON] = useState(STARTING_JSON);
  const [sending, setSending] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ipfsDownHash, setIpfsDownHash] = useState();
  const [downloading, setDownloading] = useState();
  const [ipfsContent, setIpfsContent] = useState();
  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [loadedAssets, setLoadedAssets] = useState();


  /*useEffect(() => {
    const updateYourCollectibles = async () => {
      const assetUpdate = [];
      for (const a in assets) {
        try {
          const forSale = await readContracts.DogeClubSVG.forSale(utils.id(a));
          let owner;
          if (!forSale) {
            const tokenId = await readContracts.DogeClubSVG.uriToTokenId(utils.id(a));
            owner = await readContracts.DogeClubSVG.ownerOf(tokenId);
          }
          assetUpdate.push({ id: a, ...assets[a], forSale, owner });
        } catch (e) {
          console.log(e);
        }
      }
      setLoadedAssets(assetUpdate);
    };
    if (readContracts && readContracts.DogeClubSVG) updateYourCollectibles();
  }, [assets, readContracts, transferEvents]);*/



  ////====================  ////====================  ////====================  ////====================  ////====================



    const [uploading, setUploading] = useState()
    const [imageInIpfs, setImageInIpfs] = useState()

    const uploadArea = ( <
            Upload name = "image"
            listType = "picture-card"
            className = "avatar-uploader"
            showUploadList = { false }
            customRequest = {
                async(a) => {
                    console.log("CUSTOM REQUIEST", a)
                    setUploading(true)
                    const result = await ipfs.add(a.file);
                    console.log("UPLOADED", result)
                    setImageInIpfs(result.path)
                    setUploading(false)
                }
            }
            onChange = {
                (a) => { console.log("CHANGE", a) }
            } > {
                imageInIpfs ? < img src = { "https://ipfs.io/ipfs/" + imageInIpfs }
                style = {
                    { maxWidth: 90, maxHeight: 90 }
                }
                /> : "image"} < /
                Upload >
            )

            const imageUploadAndDisplay = uploading ? < Spin style = {
                { margin: 32 }
            }
            /> : uploadArea

            const [nftName, setNFTName] = useState();
            const [nftDesc, setNFTDesc] = useState();
            const [nftUrl, setNFTUrl] = useState();
            const [animationUrl, setAnimationUrl] = useState();
            const [youtubeUrl, setYoutubeUrl] = useState();

            const textFormDisplay = ( <
                div style = {
                    { maxWidth: 320, margin: "auto", marginTop: 32, paddingBottom: 32 }
                } >
                <
                Input placeholder = "name"
                onChange = {
                    (e) => { setNFTName(e.target.value) }
                }
                value = { nftName }
                style = {
                    { marginTop: 16 }
                }
                />

                <
                TextArea placeholder = "description"
                rows = { 4 }
                style = {
                    { marginTop: 16 }
                }
                onChange = {
                    (e) => { setNFTDesc(e.target.value) }
                }
                value = { nftDesc }
                />

                <
                Input placeholder = "external url"
                onChange = {
                    (e) => { setNFTUrl(e.target.value) }
                }
                value = { nftUrl }
                style = {
                    { marginTop: 16 }
                }
                />

                <
                Input placeholder = "animation url"
                onChange = {
                    (e) => { setAnimationUrl(e.target.value) }
                }
                value = { animationUrl }
                style = {
                    { marginTop: 16 }
                }
                />

                <
                Input placeholder = "youtube url"
                onChange = {
                    (e) => { setYoutubeUrl(e.target.value) }
                }
                value = { youtubeUrl }
                style = {
                    { marginTop: 16 }
                }
                /> < /
                div >
            )

            const [notation, setNotation] = useState()

            const notationFormDisplay = ( <
                div style = {
                    { maxWidth: 520, margin: "auto", paddingBottom: 32 }
                } >
                <
                TextArea placeholder = "notation"
                rows = { 16 }
                style = {
                    { marginTop: 16 }
                }
                onChange = {
                    (e) => { setNotation(e.target.value) }
                }
                value = { notation }
                /> < /
                div >
            )

            const [manifestInIPFS, setManifestInIPFS] = useState();


            const uploadButton = ( <
                div style = {
                    { padding: 16 }
                } >
                <
                Button style = {
                    { margin: 8 }
                }
                loading = { sending }
                size = "large"
                shape = "round"
                type = "primary"
                disabled = {!notation || !nftName || !nftDesc || !imageInIpfs }
                onClick = {
                    async() => {
                        console.log(notation, nftName, nftDesc, imageInIpfs)
                        console.log("UPLOADING...", yourJSON);


                        let manifest = {
                            name: nftName,
                            description: nftDesc,
                            image: "https://ipfs.io/ipfs/" + imageInIpfs,
                            notation: notation,
                            /*

                            skipping this for now, but eventually you could add:

                            attributes: [
                              {
                                trait_type: "BackgroundColor",
                                value: "green",
                              },
                              {
                                trait_type: "Eyes",
                                value: "googly",
                              },
                            ],*/
                        }
                        if (nftUrl) {
                            manifest.external_url = nftUrl
                        }
                        if (animationUrl) {
                            manifest.animation_url = animationUrl
                        }
                        if (youtubeUrl) {
                            manifest.youtube_url = youtubeUrl
                        }

                        //console.log("manifest",manifest)

                        setSending(true);
                        setIpfsHash();
                        const result = await ipfs.add(JSON.stringify(manifest)); // addToIPFS(JSON.stringify(yourJSON))
                        setManifestInIPFS(result.path)
                        setSending(false);
                        console.log("RESULT:", result);
                    }
                } >
                Upload Manifest <
                /Button> < /
                div >
            )

            const [minting, setMinting] = useState();

            const [resultDisplay, setResultDisplay] = useState("");


            const mintButton = ( <
                Button style = {
                    { margin: 8 }
                }
                loading = { minting }
                size = "large"
                shape = "round"
                type = "primary"
                disabled = {!notation || !manifestInIPFS }
                onClick = {
                    async() => {
                        console.log("MINTING...", manifestInIPFS, notation);

                        setMinting(true);

                        const mintResult = await tx(writeContracts.DogeClubSVG.mintU(manifestInIPFS, notation))

                        setMinting(false);

                        console.log("mintResult", mintResult)
                        setResultDisplay( <
                            div style = {
                                { marginTop: 32, paddingBottom: 256 }
                            } >
                            <
                            Link onClick = {
                                () => { setRoute("/yourcollectibles") }
                            }
                            to = "/yourcollectibles" > 🎉🍾🎊Success!!!🏷Click here to view the { nftName }
                            NotationNFT!
                            <
                            /Link> < /
                            div >
                        )

                    }
                } >
                Mint NFT <
                /Button>
            )

            ////====================  ////====================  ////====================  ////====================  ////====================  ////====================  ////====================




        ////////////////////////////////////////////////////////////////



  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}

      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              SVG NFT
            </Link>
          </Menu.Item>
           <Menu.Item key="/upoba">
            <Link
              onClick={() => {
                setRoute("/upoba");
              }}
              to="/upoba"
            >
              uPOBA
            </Link>
          </Menu.Item>
          <Menu.Item key="/debug">
            <Link
              onClick={() => {
                setRoute("/debug");
              }}
              to="/debug"
            >
              Smart Contract
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {}
            <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              {isSigner?(
                <Button type={"primary"} onClick={()=>{
                  tx( writeContracts.DogeClubSVG.mintItem() )
                }}>MINT</Button>
              ):(
                <Button type={"primary"} onClick={loadWeb3Modal}>CONNECT WALLET</Button>
              )}

            </div>

            <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={item => {
                  const id = item.id.toNumber();

                  console.log("IMAGE",item.image)

                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                          </div>
                        }
                      >
                        <a href={"https://rinkeby.opensea.io/assets/"+(readContracts && readContracts.DogeClubSVG && readContracts.DogeClubSVG.address)+"/"+item.id} target="_blank">
                        <img src={item.image} />
                        </a>
                        <div>{item.description}</div>
                      </Card>

                      <div>
                        owner:{" "}
                        <Address
                          address={item.owner}
                          ensProvider={mainnetProvider}
                          blockExplorer={blockExplorer}
                          fontSize={16}
                        />
                        <AddressInput
                          ensProvider={mainnetProvider}
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={newValue => {
                            const update = {};
                            update[id] = newValue;
                            setTransferToAddresses({ ...transferToAddresses, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            tx(writeContracts.DogeClubSVG.transferFrom(address, transferToAddresses[id], id));
                          }}
                        >
                          Transfer
                        </Button>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
            <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 256 }}>

            </div>
          </Route>
                    <Route exact path="/upoba">
          <div style = {{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }} >
          
            { textFormDisplay }

            { imageUploadAndDisplay }

            {
                imageInIpfs ? < div style = {
                    { padding: 16 }
                } > < Paragraph copyable > { imageInIpfs } < /Paragraph></div > : < div style = {
                    { padding: 16 }
                } > < /div>}

                { notationFormDisplay }

                { uploadButton }

                {
                    manifestInIPFS ? < div style = {
                        { padding: 16 }
                    } > < Paragraph copyable > { manifestInIPFS } < /Paragraph></div > : < div style = {
                        { padding: 16 }
                    } > < /div>}

                    { mintButton }

                    { resultDisplay }

 
            </div >
          </Route>
          <Route path="/debug">

            <div style={{padding:32}}>
              <Address value={readContracts && readContracts.DogeClubSVG && readContracts.DogeClubSVG.address} />
            </div>

            <Contract
              name="DogeClubSVG"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
          isSigner={isSigner}
        />
        {faucetHint}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://fourswords.io/");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

/* eslint-disable */
window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

window.ethereum &&
  window.ethereum.on("accountsChanged", accounts => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });
/* eslint-enable */

export default App;
