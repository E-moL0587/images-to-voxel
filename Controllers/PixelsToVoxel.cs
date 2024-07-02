namespace ImagesToVoxel.Controllers {
  public class PixelsToVoxel {
    public List<int[]> Voxel(string frontData, string sideData, string topData, int size) {
      var voxelData = new List<int[]>();
      frontData = FlipXAxis(frontData, size);
      topData = RotateAndFlipXAxis(topData, size);

      for (int y = 0; y < size; y++) {
        for (int x = 0; x < size; x++) {
          for (int z = 0; z < size; z++) {
            int frontIndex = y * size + x;
            int sideIndex = y * size + z;
            int topIndex = x * size + z;

            if (frontData[frontIndex] == '0' && sideData[sideIndex] == '0' && topData[topIndex] == '0') {
              voxelData.Add(new int[] { x, y, z });
            }
          }
        }
      }

      return voxelData;
    }

    private string FlipXAxis(string data, int size) {
      var flipped = new char[data.Length];
      for (int y = 0; y < size; y++) {
        for (int x = 0; x < size; x++) {
          flipped[y * size + x] = data[y * size + (size - x - 1)];
        }
      }
      return new string(flipped);
    }

    private string RotateAndFlipXAxis(string data, int size) {
      var rotatedFlipped = new char[data.Length];
      for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
          rotatedFlipped[j * size + (size - i - 1)] = data[i * size + j];
        }
      }
      return new string(rotatedFlipped);
    }
  }
}
