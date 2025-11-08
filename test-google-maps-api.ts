// Quick test for Google Maps API
import 'dotenv/config';
import { Client } from '@googlemaps/google-maps-services-js';

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

console.log('\n🔍 Google Maps API Test\n');
console.log('='.repeat(60));

if (!apiKey) {
  console.log('❌ GOOGLE_MAPS_API_KEY not found in environment');
  process.exit(1);
}

console.log(`✅ API Key found: ${apiKey.substring(0, 20)}...`);
console.log(`📏 Key length: ${apiKey.length} characters`);
console.log('\n' + '='.repeat(60));

const client = new Client({});

// Test locations in HCMC
const origin = { lat: 10.762622, lng: 106.660172 }; // District 1
const destination = { lat: 10.775847, lng: 106.704365 }; // District 3

console.log('\n📍 Test Route:');
console.log(`   From: District 1 (${origin.lat}, ${origin.lng})`);
console.log(`   To: District 3 (${destination.lat}, ${destination.lng})`);

console.log('\n🌐 Calling Distance Matrix API...\n');

client
  .distancematrix({
    params: {
      origins: [origin],
      destinations: [destination],
      mode: 'driving' as any,
      units: 'metric' as any,
      key: apiKey,
    },
  })
  .then((response) => {
    console.log('✅ API Response Status:', response.data.status);

    if (response.data.status !== 'OK') {
      console.log(
        '❌ Error:',
        response.data.error_message || response.data.status,
      );
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Enable "Distance Matrix API" in Google Cloud Console');
      console.log('   2. Setup billing (credit card required)');
      console.log('   3. Check API restrictions (IP/referrer)');
      console.log('   4. Verify API key is not expired\n');
      process.exit(1);
    }

    const element = response.data.rows[0].elements[0];

    if (element.status !== 'OK') {
      console.log('❌ Element Error:', element.status);
      process.exit(1);
    }

    const distanceKm = element.distance.value / 1000;
    const durationMin = Math.ceil(element.duration.value / 60);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Google Maps API is working!');
    console.log('='.repeat(60));
    console.log('\n📊 Results:');
    console.log(`   Distance: ${distanceKm.toFixed(2)} km`);
    console.log(`   Duration: ${durationMin} minutes`);
    console.log(
      `   Text: ${element.distance.text} in ${element.duration.text}`,
    );

    // Calculate Haversine for comparison
    const R = 6371;
    const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
    const dLon = ((destination.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const haversineKm = R * c;

    console.log('\n📐 Comparison:');
    console.log(`   Haversine (straight): ${haversineKm.toFixed(2)} km`);
    console.log(`   Google Maps (road): ${distanceKm.toFixed(2)} km`);
    console.log(
      `   Difference: +${((distanceKm / haversineKm - 1) * 100).toFixed(1)}%`,
    );

    console.log('\n🎉 Your API is configured correctly!');
    console.log('   Journey Planning will now use actual road distances.\n');
  })
  .catch((error) => {
    console.log('\n❌ API Call Failed!\n');

    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Text:', error.response.statusText);
      if (error.response.data) {
        console.log(
          'Response Data:',
          JSON.stringify(error.response.data, null, 2),
        );
      }
    } else if (error.request) {
      console.log('No response received from server');
      console.log('Request:', error.request);
    } else {
      console.log('Error:', error.message);
    }

    console.log('\n💡 Common Issues:');
    console.log('   1. Invalid or expired API key');
    console.log('   2. Distance Matrix API not enabled');
    console.log('   3. Billing not set up');
    console.log('   4. API key has IP/referrer restrictions');
    console.log('   5. Quota exceeded\n');

    process.exit(1);
  });
