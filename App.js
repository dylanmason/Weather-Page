import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View, Animated } from 'react-native';
import * as Location from 'expo-location';
import React, {useEffect, useState, useRef} from 'react';
import { Ionicons } from '@expo/vector-icons'; 
import { KEY } from './key';
export default function App() {

    const units = "imperial";

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [weather, setWeather] = useState(null);
    const [town, setTown] = useState(null);
    const [currentTemperature, setCurrentTemperature] = useState(null);
    const [feelsLike, setFeelsLike] = useState(null);
    const [sunset, setSunset] = useState(null);
    const [sunrise, setSunrise] = useState(null);
    const [currentTime, setCurrentTime] = useState(null); 
    const fadeAnimation = useRef(new Animated.Value(0)).current;

    const fadeIn = () => {
        Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
        }).start();
    };

    const Icon = () => {
        if (weather === "clear sky" || weather === "mist") {
            if ((currentTime > sunset) || (currentTime < sunrise)) {
                return (
                    <Ionicons name="ios-moon-outline" size={48} color='hsl(204, 100%, 90%)' />
                );
            }
            if ((currentTime > sunrise) && (currentTime < sunset)) {
                return (
                    <Ionicons name="ios-sunny-outline" size={48} color='hsl(204, 100%, 90%)' />
                );
            }
        }
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            const latitude = location.coords.latitude;
            const longitude = location.coords.longitude;
            const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${KEY}`);
            const jsonInfo = await data.json();
            console.log(jsonInfo);
            setWeather(jsonInfo.weather[0].description);
            setTown(jsonInfo.name);
            setCurrentTemperature(jsonInfo.main.temp);
            setFeelsLike(jsonInfo.main.feels_like);
            setSunset(new Date(jsonInfo.sys.sunset * 1000).toLocaleTimeString());
            setSunrise(new Date(jsonInfo.sys.sunrise * 1000).toLocaleTimeString());
            setCurrentTime(new Date().toLocaleTimeString());
            fadeIn();
        })();
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (weather) {
        text = JSON.stringify(weather);
    }


    return (
        <View style={styles.container}>
        <Animated.View style={[
            styles.container,
            {
                opacity: fadeAnimation,
            },
        ]}>
        <Icon />
        <Text style={styles.townText}>{town}</Text>
        <Text style={styles.currentTemperatureText}>{currentTemperature}&deg;F</Text>
        <Text style={styles.feelsLikeText}>{feelsLike}&deg;F</Text>
        </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'hsl(204, 100%, 50%)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    currentTemperatureText: {
        color: 'hsl(204, 100%, 90%)',
        fontSize: 48,
    },
    feelsLikeText: {
        color: 'hsl(204, 100%, 90%)',
        fontSize: 14,
    },
    townText: {
        color: 'hsl(204, 100%, 90%)',
        fontSize: 32,
    },
});
