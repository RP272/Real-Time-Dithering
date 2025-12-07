#include <opencv2/opencv.hpp>
#include <iostream>
#include <thread>

using namespace cv;
using namespace std;

void floyd_steinberg_dithering(Mat* frame) {
    // Convert to grayscale
    Mat gray;
    cvtColor(*frame, gray, COLOR_BGR2GRAY);

    // Convert to float so we can accumulate error without clipping
    Mat f;
    gray.convertTo(f, CV_32F);

    const int rows = f.rows;
    const int cols = f.cols;

    // Floyd-Steinberg diffusion weights:
    //       X    7/16
    // 3/16  5/16  1/16
    for (int y = 0; y < rows; ++y) {
        for (int x = 0; x < cols; ++x) {
            float oldpix = f.at<float>(y, x);
            // threshold 127 as requested
            float newpix = (oldpix <= 127.0f) ? 0.0f : 255.0f;
            float err = oldpix - newpix;
            f.at<float>(y, x) = newpix;

            // distribute error
            if (x + 1 < cols) {
                f.at<float>(y, x + 1) += err * (7.0f / 16.0f);
            }
            if (y + 1 < rows) {
                if (x - 1 >= 0) {
                    f.at<float>(y + 1, x - 1) += err * (3.0f / 16.0f);
                }
                f.at<float>(y + 1, x) += err * (5.0f / 16.0f);
                if (x + 1 < cols) {
                    f.at<float>(y + 1, x + 1) += err * (1.0f / 16.0f);
                }
            }
        }
    }

    // Convert back to 8-bit and then to BGR for display (so putText color works)
    Mat out8u;
    f.convertTo(out8u, CV_8U);
    cvtColor(out8u, *frame, COLOR_GRAY2BGR);
}

int main() {
    VideoCapture cap;

    if (!cap.open(CAP_ANY)) {
        cerr << "ERROR: Could not open camera\n";
        return -1;
    }

    namedWindow("Camera View", WND_PROP_FULLSCREEN);
    setWindowProperty("Camera View", WND_PROP_FULLSCREEN, WINDOW_FULLSCREEN);

    Mat frame;
    int64 t;

    for (;;) {
        if (!cap.read(frame)) {
            cerr << "ERROR: Failed to read frame from camera\n";
            break;
        }

        t = getTickCount();

        floyd_steinberg_dithering(&frame);

        t = getTickCount() - t;
        // {
        //     ostringstream buf;
        //     buf << "FPS: " << fixed << setprecision(1) << (getTickFrequency() / (double)t);
        //     putText(frame, buf.str(), Point(10, 30), FONT_HERSHEY_PLAIN, 2.0, Scalar(0, 0, 255), 2, LINE_AA);
        // }
        flip(frame, frame, 1);
        imshow("Camera View", frame);

        int key = waitKey(1);
        if (key == 27) {
            cout << "ESC pressed - exiting\n";
            break;
        }
    }

    cap.release();
    destroyAllWindows();
    return 0;
}
