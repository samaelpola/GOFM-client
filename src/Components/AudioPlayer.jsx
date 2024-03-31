import React, {useEffect, useRef, useState} from "react";
import {Button, Card, CardBody, Image, Skeleton, Tab, Tabs} from "@nextui-org/react";
import {PreviousIcon} from "./PreviousIcon";
import {PauseCircleIcon} from "./PauseCircleIcon";
import {NextIcon} from "./NextIcon";
import {PLayCircleIcon} from "./PlayCircleIcon.jsx";
import {MusicIcon} from "./MusicIcon.jsx";


export const AudioPlayerComponent = () => {
    const audioContextRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [start, setStart] = useState(false);
    const [music, setMusic] = useState(null);
    const [audioSource, setAudioSource] = useState(null);
    const [currentStationName, setCurrentStationName] = useState("GO RAP");
    const [gifStopped, setGifStopped] = useState(true);
    const [play, setPlay] = useState(false);
    let currentMusicID = 0;

    const stations = {
        "GO GEN": `${SERVER_WS_ENDPOINT}/GO-GEN`,
        "GO RAP": `${SERVER_WS_ENDPOINT}/GO-RAP`,
        "GO POP": `${SERVER_WS_ENDPOINT}/GO-POP`,
        "GO SLOW": `${SERVER_WS_ENDPOINT}/GO-SLOW`,
        "GO ROCK": `${SERVER_WS_ENDPOINT}/GO-ROCK`
    };

    const stationsName = ["GO GEN", "GO POP", "GO RAP", "GO ROCK", "GO SLOW"];

    const connectToStation = (stationName) => {
        if (socket !== null) {
            socket.close();
            setMusic(null);
        }

        const newSocket = new WebSocket(stations[stationName]);
        newSocket.onopen = () => {
            console.log("WebSocket connected");
        };

        newSocket.onerror = (ev) => {
            console.error("WebSocket error:", ev);
        };

        setSocket(newSocket);
    }

    const changeStation = () => {
        if (audioSource !== null) {
            audioSource.stop();
            setMusic(null);
        }
        connectToStation(currentStationName)
        setPlay(true);
        setGifStopped(false);
    }

    const nextStation = () => {
        if (audioSource !== null) {
            audioSource.stop();
            setMusic(null);
        }

        let i = stationsName.indexOf(currentStationName);
        if (i === stationsName.length - 1) {
            setCurrentStationName(stationsName[0]);
            connectToStation(stationsName[0]);
        } else {
            setCurrentStationName(stationsName[i + 1]);
            connectToStation(stationsName[i + 1]);
        }
        setPlay(true);
        setGifStopped(false);
    }

    const previousStation = () => {
        if (audioSource !== null) {
            audioSource.stop();
            setMusic(null);
        }

        let i = stationsName.indexOf(currentStationName);
        if (i === 0) {
            setCurrentStationName(stationsName[stationsName.length - 1]);
            connectToStation(stationsName[stationsName.length - 1]);
        } else {
            setCurrentStationName(stationsName[i - 1]);
            connectToStation(stationsName[i - 1]);
        }
        setPlay(true);
        setGifStopped(false);
    }

    useEffect(() => {
        if (socket === null) {
            return;
        }

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onerror = (ev) => {
            console.error("WebSocket error:", ev);
        };

        if (start) {
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (currentMusicID !== parseInt(data.Id)) {
                    setMusic(data);
                    console.log("update", currentMusicID, " to ", data.Id);
                    currentMusicID = parseInt(data.Id);
                }

                console.log(data);

                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                }

                const audioContext = audioContextRef.current;

                audioContext.decodeAudioData(base64ToArrayBuffer(data.Audio), (audioBuffer) => {
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    setAudioSource(source);
                    source.start();
                }).then();
            };
        }

        socket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            socket.close();
        };
    }, [start, socket]);

    const base64ToArrayBuffer = (base64) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    function handleStop() {
        if (socket === null) {
            connectToStation(currentStationName);
            setGifStopped(false);
            setPlay(true);
            return;
        }

        if (audioSource !== null) {
            audioSource.stop();
        }
        socket.close();
        setSocket(null);
        setGifStopped(true);
        setPlay(false)
    }

    function handleStart() {
        setStart(!start);
        connectToStation(currentStationName);
        setGifStopped(false);
        setPlay(true);
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            {
                start ?
                    (
                        <Card
                            isBlurred
                            className="bg-background/60 border-none max-w-[900px] mx-auto min-h-[50vh] min-w-[82vw]"
                            shadow="sm"
                        >
                            <CardBody className="!h-full flex justify-center p-10">
                                <div
                                    className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
                                    <div className="relative col-span-6 md:col-span-4 !h-full">
                                        {
                                            music === null ?
                                                (
                                                    <Skeleton className="rounded-lg">
                                                        <div
                                                            className="h-80 w-[100vw] rounded-lg bg-slate-200"></div>
                                                    </Skeleton>
                                                ) :
                                                (
                                                    <Image
                                                        alt="Album cover"
                                                        className="object-fill h-80 w-[100vw]"
                                                        shadow="md"
                                                        src={`${API_ENDPOINT}/musics/${music.Id}/image`}
                                                    />
                                                )
                                        }
                                    </div>

                                    <div className="flex flex-col col-span-6 md:col-span-8">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-3 w-full">
                                                <div className="flex w-full flex-col">
                                                    <Tabs aria-label="Options" color="light" variant="bordered"
                                                          selectedKey={currentStationName}
                                                          onSelectionChange={setCurrentStationName}
                                                          onClick={changeStation}
                                                          classNames={{
                                                              tabList: "bg-gradient-to-tr from-[#FFB457] to-[#FF705B] font-bold border-none overflow-y-scroll",
                                                              tabContent: "text-gray-700",
                                                              cursor: "!backdrop-blur-3xl bg-white/40"
                                                          }}>
                                                        <Tab
                                                            key="GO GEN"
                                                            title={
                                                                <div className="flex items-center space-x-2">
                                                                    <MusicIcon/>
                                                                    <span>GO GEN</span>
                                                                </div>
                                                            }
                                                        />
                                                        <Tab
                                                            key="GO POP"
                                                            title={
                                                                <div className="flex items-center space-x-2">
                                                                    <MusicIcon/>
                                                                    <span>GO POP</span>
                                                                </div>
                                                            }
                                                        />
                                                        <Tab
                                                            key="GO RAP"
                                                            title={
                                                                <div className="flex items-center space-x-2">
                                                                    <MusicIcon/>
                                                                    <span>GO RAP</span>
                                                                </div>
                                                            }
                                                        />
                                                        <Tab
                                                            key="GO ROCK"
                                                            title={
                                                                <div className="flex items-center space-x-2">
                                                                    <MusicIcon/>
                                                                    <span>GO ROCK</span>
                                                                </div>
                                                            }
                                                        />
                                                        <Tab
                                                            key="GO SLOW"
                                                            title={
                                                                <div className="flex items-center space-x-2">
                                                                    <MusicIcon/>
                                                                    <span>GO SLOW</span>
                                                                </div>
                                                            }
                                                        />
                                                    </Tabs>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground/ text-3xl">{currentStationName}</h3>
                                                </div>
                                                {
                                                    music === null ?
                                                        (
                                                            <div className="flex flex-col gap-3 w-80">
                                                                <Skeleton className="rounded-lg w-32">
                                                                    <div
                                                                        className="h-4 w-28 rounded-lg bg-slate-200"/>
                                                                </Skeleton>
                                                                <Skeleton className="rounded-lg">
                                                                    <div
                                                                        className="h-4 w-32 rounded-lg bg-slate-200"/>
                                                                </Skeleton>
                                                            </div>
                                                        ) :
                                                        (
                                                            <div>
                                                                <h3 className="font-semibold text-2xl text-foreground/90">{music.Title}</h3>
                                                                <p className="text-xl text-foreground/80">{music.Name}</p>
                                                            </div>
                                                        )
                                                }
                                            </div>
                                        </div>

                                        <div className="w-full h-16 mb-8 mt-6">
                                            {
                                                gifStopped || music === null ?
                                                    (
                                                        <Image className="object-fill h-16 w-[100vw]"
                                                               src="/audio.png"/>
                                                    ) :
                                                    (
                                                        <Image className="object-fill h-16 w-[100vw]"
                                                               src="/audio-animation.gif"/>
                                                    )
                                            }
                                        </div>

                                        <div className="flex w-full items-center justify-center gap-6">
                                            <Button
                                                isIconOnly
                                                className="data-[hover]:bg-foreground/10"
                                                radius="full"
                                                variant="light"
                                                onClick={previousStation}
                                            >
                                                <PreviousIcon size={54}/>
                                            </Button>
                                            <Button
                                                isIconOnly
                                                className="w-auto h-auto data-[hover]:bg-foreground/10"
                                                radius="full"
                                                variant="light"
                                                onClick={handleStop}
                                            >
                                                {
                                                    play ?
                                                        (
                                                            <PauseCircleIcon size={60}/>
                                                        ) :
                                                        (
                                                            <PLayCircleIcon size={60}/>
                                                        )
                                                }
                                            </Button>
                                            <Button
                                                isIconOnly
                                                className="data-[hover]:bg-foreground/10"
                                                radius="full"
                                                variant="light"
                                                onClick={nextStation}
                                            >
                                                <NextIcon size={54}/>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ) :
                    <div
                        className="flex bg-background/60 w-full max-w-sm mx-auto overflow-hidden rounded-lg shadow-lg lg:max-w-4xl">
                        <div className="bg-cover lg:block lg:w-1/2 pt-10 pl-6">
                            <Image
                                src="/gofmlogo.png"
                                alt="logo"
                                classNames="object-fill h-80 w-[100vw]"
                            />
                        </div>
                        <div className="w-full px-6 py-8 md:px-8 lg:w-1/">
                            <div className="max-w-xl">
                                <h2 className="text-3xl font-semibold text-dark lg:text-4xl">
                                    WELCOME TO GO FM RADIO
                                </h2>

                                <p className="mt-4 text-sm text-dark lg:text-base">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis commodi cum
                                    cupiditate
                                    ducimus, fugit harum id necessitatibus odio quam quasi, quibusdam rem tempora
                                    voluptates.
                                </p>

                                <div className="flex flex-col mt-6 items-center justify-center">
                                    <Button onClick={handleStart}
                                            className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg">
                                        Start
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
}


