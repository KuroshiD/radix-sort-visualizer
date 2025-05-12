#include <iostream>
#include <vector>
#include <math.h>
using namespace std;

int get_max(vector<int> &arr){
    int max = arr[0];
    for(int i = 1; i < arr.size(); i++){
        if(arr[i] > max) max = arr[i];
    }
    return max;
}

void order_by(vector<int> &arr, int position){
    size_t size = arr.size();
    vector<int> result(size);
    int count[10] = {0};

    for(int i = 0; i < size; i++){
        count[(arr[i] / position) % 10]++;

    }

    for(int i = 1; i < 10; i++){
        count[i] += count[i-1];
    }

    for(int i = size-1; i >= 0; i--){
        int pos = (arr[i] / position) % 10;
        result[count[pos] - 1] = arr[i];
        count[pos]--;
    }

    for(int i = 0; i < size; i++){
        arr[i] = result[i];
    }
}

void radix_sort(vector<int> &arr){
    size_t size = arr.size();
    int max_value = get_max(arr);

    for(int i = 1; max_value/i > 0; i *= 10){
        order_by(arr, i);
    }
}

void print(vector<int> &arr){
    for(int i = 0; i < arr.size(); i++){
        cout << arr[i] << ' ';
    }
    cout << endl;
}

int main(){
    vector<int> vec = {5, 10, 250, 32, 13, 22};
    print(vec);
    radix_sort(vec);
    print(vec);

    return 0;
}