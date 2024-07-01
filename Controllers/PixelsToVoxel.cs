namespace ImagesToVoxel.Controllers {
  public class PixelsToVoxel {
    public List<int[]> Voxel(string frontData, string sideData, string topData, int size) {
      var voxelData = new List<int[]>();

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
  }
}
