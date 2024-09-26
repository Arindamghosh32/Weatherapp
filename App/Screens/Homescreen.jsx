import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, Modal, Image, TouchableOpacity, ScrollView } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import * as Location from 'expo-location';
import axios from 'axios';

export default function Homescreen() {
  const [searchInput, setSearchInput] = useState('');
  const [suggestLocation, setSuggestLocation] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [hourlyWeather, setHourlyWeather] = useState([]); 
  const [precipitation, setPrecipitation] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setLocation({ latitude, longitude });
    fetchWeather(latitude, longitude);
    fetchHourlyWeather(latitude, longitude); 
  };

  const fetchWeather = async (latitude, longitude) => {
    const API_KEY = '018deb8c4c26de336c095eaff32b8528'; 
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
    try {
      const response = await axios.get(url);
      setWeather(response.data);
      const rain = response.data.rain ? response.data.rain['1h'] : 0;
      const snow = response.data.snow ? response.data.snow['1h'] : 0;
      setPrecipitation({ rain, snow });
      console.log(`Icon URL: https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`);
    } catch (error) {
      console.log('Error while fetching the weather data');
      console.error(error);
    }
  };

  const fetchHourlyWeather = async (latitude, longitude) => {
    const API_KEY = '018deb8c4c26de336c095eaff32b8528'; 
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
    try {
      const response = await axios.get(url);
      setHourlyWeather(response.data.list); 
    } catch (error) {
      console.log('Error fetching the hourly data');
      console.error(error);
    }
  };

  const fetchlocationsuggestion = async (query) => {
    if (!query) {
      console.log('Query is empty');
      return;
    }
  
    const API_KEY = '018deb8c4c26de336c095eaff32b8528';
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
    try {
      const response = await axios.get(url);
      console.log('Fetched locations:', response.data); // Check the response
      setSuggestLocation(response.data);
    } catch (error) {
      console.log('Error fetching location suggestions', error.message); // Log the error message
    }
  };
  

  const selectLocation = (location) => {
    setSearchInput(location.name);
    setModalVisible(false);
    fetchWeather(location.lat, location.lon);
    fetchHourlyWeather(location.lat, location.lon);
  };

  const handleRefresh = () => {
    if (location) {
      fetchWeather(location.latitude, location.longitude);
      fetchHourlyWeather(location.latitude, location.longitude);
    } else {
      getLocation();
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/darkcloud.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <TouchableOpacity style={{color:'white',marginTop:24,marginRight:-280}} onPress={() => setModalVisible(true)}>
          <AntDesign name="plus" size={34} color="white" />
        </TouchableOpacity>
        {weather && (
          <View>
            <View style={styles.weatherContainer}>
              <View style={styles.tempicon}>
                <View>
                  <TouchableOpacity onPress={handleRefresh} style={{ marginBottom: 20 }}>
                    <Feather name="refresh-ccw" size={24} color="white" />
                  </TouchableOpacity>

                  <Text style={styles.weatherText}>
                    {weather.name}: {weather.weather[0].description}
                  </Text>
                  <Text style={{ fontSize: 28, color: 'white' }}>{weather.main.temp}°C</Text>
                  <Text style={{ fontSize: 10, color: 'white', marginBottom: 5 }}>
                    {new Date().toLocaleDateString()}
                  </Text>
                  <Text style={{ fontSize: 10, color: 'white', marginBottom: 5 }}>
                     {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View>
                  <Image
                    style={styles.weatherIcon}
                    source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` }}
                  />
                  <Text style={{ fontSize: 10, color: 'white', marginTop: -20 }}>Feels like: {weather.main.feels_like}°C</Text>
                </View>
              </View>

              {precipitation && (
                <View>
                  {precipitation.rain > 0 && (
                    <Text style={{ color: 'white' }}>Precipitation for rain: {precipitation.rain} mm in the last hour</Text>
                  )}
                  {precipitation.snow > 0 && (
                    <Text style={{ color: 'white' }}>Precipitation for snow: {precipitation.snow} mm in the last hour</Text>
                  )}
                  {precipitation.rain === 0 && precipitation.snow === 0 && (
                    <Text style={{ color: 'white', marginTop: 20 }}>No precipitation today</Text>
                  )}
                </View>
              )}

              <ScrollView horizontal={true} style={{ marginTop: 20 }}>
                {hourlyWeather.slice(0, 6).map((forecast, index) => (
                  <View key={index} style={styles.hourlyItem}>
                    <Text style={styles.hourlyText}>
                      {new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Image
                      style={styles.hourlyIcon}
                      source={{ uri: `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png` }}
                    />
                    <Text style={styles.hourlyText}>{forecast.main.temp}°C</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      <Modal
  animationType="slide"
  transparent={false}
  visible={modalVisible}
  onRequestClose={() => {
    setModalVisible(!modalVisible);
  }}
>
  <View style={styles.modalView}>
    <TouchableOpacity
      style={styles.button}
      onPress={() => setModalVisible(!modalVisible)}
    >
      <Text style={styles.buttonText}><Entypo name="cross" size={24} color="white" /></Text>
    </TouchableOpacity>
    <View style={styles.searchbox}>
      <TextInput
        style={{ color: 'white', flex: 1 }}
        placeholder='Search...'
        placeholderTextColor='white'
        onChangeText={(text) => {
          setSearchInput(text);
          if (text.length > 2) {
            fetchlocationsuggestion(text); // Pass the text to fetch locations
          } else {
            setSuggestLocation([]);
          }
        }}
        value={searchInput}
      />
    </View>
    <ScrollView style={{ flex: 1 }}>
      {suggestLocation.length > 0 ? (
        suggestLocation.map((location, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => selectLocation(location)}
            style={styles.locationItem}
          >
            <Text style={styles.locationText}>
              {location.name}, {location.state ? location.state + ', ' : ''}{location.country}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={{ color: 'white', textAlign: 'center' }}>No locations found</Text>
      )}
    </ScrollView>
  </View>
</Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
  weatherContainer: {
    marginTop: 20,
    borderRadius: 50,
    backgroundColor: '#878080',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 350
  },
  weatherText: {
    color: 'white',
    fontSize: 11,
    opacity: 1,
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  tempicon: {
    display: 'flex',
    flexDirection: 'row',
    gap: 80,
  },
  hourlyItem: {
    marginTop: 10,
  },
  hourlyText: {
    color: 'white',
    fontSize: 14,
  },
  hourlyIcon: {
    width: 50,
    height: 50,
    marginTop: 5,
    marginRight: 50,
  },
  modalView: {
    flex: 1,
    backgroundColor: 'black',
  },
  searchbox: {
    borderWidth: 2,
    borderColor: 'white',
    width: 360,
    height: 50,
    margin: 20,
    padding: 10,
    borderRadius: 20,
  },
  button: {
    margin: 10,
  },
  buttonText: {
    color: 'white',
  },
  locationText: {
    color: 'white',
    fontSize: 18,
    paddingHorizontal: 30,
    marginBottom:30,
    
  },
});
