namespace ImagesToVoxel.Controllers {
  public class PixelsToVoxel {
    public List<int[]> Voxel(string frontData, string sideData, string topData, int width) {
      var voxelData = new List<int[]>();

      for (int y = 0; y < width; y++) {
        for (int x = 0; x < width; x++) {
          for (int z = 0; z < width; z++) {
            int frontIndex = y * width + x;
            int sideIndex = y * width + z;
            int topIndex = x * width + z;

            if (frontData[frontIndex] == '0' && sideData[sideIndex] == '0' && topData[topIndex] == '0') {
              voxelData.Add(new int[] { x, y, z });
            }
          }
        }
      }

      return voxelData;
    }
  }
}
