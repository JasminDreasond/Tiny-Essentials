# **v1 - Tiny Essentials**

This folder contains the core version of the **Tiny Essentials** library, which includes a collection of simple but essential utility scripts for various projects. Each script is modular and can be imported independently for ease of use. Below is an overview of the individual modules included in this version.

## **Modules Overview**

### 1. **`array.mjs`**
   - **Description**: Contains array-related utilities, such as the function to shuffle elements in an array using the Fisher-Yates algorithm.
   - **Main Features**:
     - Shuffle elements randomly in an array.

### 2. **`clock.mjs`**
   - **Description**: Provides date and time-related utilities, including functions for formatting and calculating durations.
   - **Main Features**:
     - Calculate the time duration between two dates.
     - Format durations in a readable form (e.g., HH:MM:SS).
     - Format timers with days, hours, minutes, and seconds.

### 3. **`objFilter.mjs`**
   - **Description**: Contains functions for filtering and manipulating objects, providing an easy way to access and modify properties.
   - **Main Features**:
     - Filter and modify objects based on specific criteria or conditions.

### 4. **`simpleMath.mjs`**
   - **Description**: Offers basic mathematical utilities, such as performing percentage calculations and Rule of Three operations.
   - **Main Features**:
     - Calculate percentages.
     - Execute Rule of Three calculations (direct and inverse proportions).

### 5. **`text.mjs`**
   - **Description**: Provides text manipulation utilities, including string formatting functions for title casing and handling simple transformations.
   - **Main Features**:
     - Convert strings to title case (capitalizing first letters of each word).
     - Convert strings to title case with lowercase first letter.

## **How to Use**

All the functions provided in the individual modules above can also be accessed through a global entry point, located at `./src/index.mjs`. By importing this single file, you can access all the utilities without needing to import each module separately. This is convenient for projects that require multiple functionalities from Tiny Essentials.

Example of usage:

```javascript
import { shuffleArray, formatTimer, objType, calculatePercentage, toTitleCase } from 'tiny-essentials';
```

Make sure to use the appropriate module based on your needs, and call the functions as demonstrated in their respective documentation.