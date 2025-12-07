cmake_minimum_required(VERSION 4.0)
project(cpp_desktop)

set(CMAKE_CXX_STANDARD 20)

set(CMAKE_TOOLCHAIN_FILE "C:/Users/robibobi/.vcpkg-clion/vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "")
set(VCPKG_TARGET_TRIPLET=x64-mingw-dynamic)

add_executable(cpp_desktop main.cpp)

find_package(OpenCV REQUIRED COMPONENTS core imgproc highgui)
target_link_libraries(cpp_desktop PRIVATE ${OpenCV_LIBS})