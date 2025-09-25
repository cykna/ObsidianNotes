Nowadays, we have several ways to compile a file, and CMake is an excellent tool. 
CMake is a build system generator. You create *CMakeLists.txt*, CMake uses it to generate build files. 

The way of CMake:  
Some reasons to use CMake to build instead of g++ or clang++ are clear, both are used for small projects, they become hard to manage for larger projects. CMake is used to precisely specify how the code should work, it generates commands tailored to the project itself. g++ and clang++ are compilers, they take source code and translate it into machine code. CMake will still call g++ or clang++, but with the correct options automatically set.

CMake is cross-platform, this means you can write a single *CMakeLists.txt* that works in any operating system. This happens during the build process, where you specify which system should compile the code, and CMake automatically generates the correct build files for specific environment. You can have developers on Windows, Linux, macOS, everyone works from the same *CMakeLists.txt*.

CMakeLists.txt is the core of CMake, it is the configuration file that manages dependencies and build settings.”. It has a very interesting anatomy. 

```
# Example using Dawn and Threads

# Minimum required version: 3.10
cmake_minimum_required(VERSION 3.10)

# Name of project and its metadatas
project(MyProgram
		VERSION 1.0.0
		DESCRIPTION "Example"
		LANGUAGES CXX)

# C++ version 17+ is strictly required for compilation
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON) 

# Searches for the Dawn library and threads on the system
find_package(Threads REQUIRED)
find_package(dawn REQUIRED)

# Create executable
add_executable(example main.cpp)

# Link with Dawn and threads

target_link_libraries(example
			dawn::dawn
			Threads::Threads)
			
# Include Dawn headers

target_include_directories(example PRIVATE ${DAWN_INCLUDE_DIRS})

```

This *CMakeLists* defines the project, sets, compilation options, dependencies and how to build the final executable 
