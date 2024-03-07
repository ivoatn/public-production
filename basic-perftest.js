import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  // Perform 10 requests sequentially
  for (let i = 0; i < 10; i++) {
    http.get('http://spicy.kebab.solutions:31000');
  }

  // Wait for 30 seconds
  sleep(35);

  // Repeat the process until 5 minutes have passed
  // Adjust the duration based on your requirements
  const totalTime = 2 * 60; // 
  let elapsedTime = 0;

  while (elapsedTime < totalTime) {
    // Perform 10 requests sequentially
    for (let i = 0; i < 10; i++) {
      http.get('http://spicy.kebab.solutions:31000');
    }

    // Wait for 30 seconds
    sleep(30);

    // Update elapsed time
    elapsedTime += 30; // 30 seconds per iteration
  }
}
